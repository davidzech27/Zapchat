use chrono::prelude::*;
use futures_util::{
    stream::{SplitSink, SplitStream},
    SinkExt, StreamExt, TryFutureExt, TryStreamExt,
};
use std::sync::Arc;
use tokio::net::TcpStream;
use tokio::sync::{
    mpsc::{self, UnboundedSender},
    Mutex,
};
use tokio_tungstenite::WebSocketStream;
use tungstenite::{
    protocol::{frame::coding::CloseCode, CloseFrame},
    Message,
};

use self::{response::ErrorResponse, user_operation::UserOperation};
use super::nc_loop::user_event::{PresenceData, TextMessageData, UserEvent};
use super::{error::ConnectionError, nc_loop::nats_message::NatsMessage};
use crate::db::{
    conversation_id::{ConversationId, ConversationRole},
    Database,
};
use response::TextMessage;

pub mod response;
mod user_operation;

pub struct WsLoop {
    pub user_rx: SplitStream<WebSocketStream<TcpStream>>,
    pub user_tx: Arc<Mutex<SplitSink<WebSocketStream<TcpStream>, Message>>>,
    pub db: Arc<Database>,
    pub nc: Arc<nats::asynk::Connection>,
    pub username: String,
}

impl WsLoop {
    pub async fn handle(
        mut self,
        mut cancel_rx: mpsc::Receiver<()>,
    ) -> Result<(), ConnectionError> {
        let (err_tx, mut err_rx) = mpsc::unbounded_channel::<ConnectionError>(); // unbounded because theoretically many ws sends could fail at once

        while let Some(message) = tokio::select! {
            next = self.user_rx.next() => next,
            _ = cancel_rx.recv() => {
                return Ok(());
            }
        } {
            let message = message?;

            match message {
                Message::Text(message) => {
                    let user_operation = UserOperation::from_str(&message)
                        .map_err(|_| ConnectionError::UnsupportedFormat(message))?;

                    self.handle_operation(user_operation, err_tx.clone());
                }
                Message::Close(close_frame) => {
                    if let Some(close_frame) = close_frame {
                        match close_frame.code {
                            CloseCode::Normal | CloseCode::Away => {
                                return Ok(());
                            }
                            _ => {
                                return Err(ConnectionError::UnexpectedClose(
                                    close_frame.to_string(),
                                ))
                            }
                        }
                    }

                    return Ok(());
                }
                _ => {
                    return Err(ConnectionError::UnsupportedFormat(message.to_string()));
                }
            }
        }

        Ok(())
    }

    fn handle_operation(
        &self,
        user_operation: UserOperation,
        err_tx: UnboundedSender<ConnectionError>,
    ) {
        let user_tx = self.user_tx.clone();
        let db = self.db.clone();
        let nc = self.nc.clone();
        let username = self.username.clone();

        tokio::task::spawn(async move {
            match user_operation {
                UserOperation::Choose {
                    content,
                    choosee_username,
                } => {
                    let conversation_id =
                        ConversationId::new(username.clone(), choosee_username.clone());

                    let user_event = UserEvent::Chosen(TextMessageData {
                        conversation_id: conversation_id.to_string(),
                        content: content.clone(),
                        sent_at: DateTime::<Utc>::default(),
                    });

                    let nats_message = NatsMessage {
                        to_username_hash: conversation_id.get_choosee_hash().to_owned(),
                        user_event,
                    };

                    // ignoring errors because user doesn't need to know about them

                    tokio::task::spawn(async move {
                        let _ = nc
                            .publish(nats_message.subject(), nats_message.data())
                            .await
                            .map_err(|err| {
                                error!("Error while publishing chosen user event to nats: {}", err);
                            });
                    });

                    let db_clone = db.clone();
                    let username = username.clone();
                    let conversation_id_string = conversation_id.to_string();

                    tokio::task::spawn(async move {
                        let _ = db_clone
                            .new_conversation(&username, &choosee_username, &conversation_id_string)
                            .await; // errors already logged in Database struct
                    });

                    let conversation_id_string = conversation_id.to_string();

                    let _ = db
                        .new_message(&conversation_id_string, &content, true)
                        .await;
                }
                UserOperation::Send {
                    content,
                    conversation_id,
                } => {
                    let conversation_id = ConversationId::from(conversation_id);

                    let (to_username_hash, from_chooser) =
                        match conversation_id.get_role_of_username(&username) {
                            ConversationRole::Chooser => {
                                (conversation_id.get_choosee_hash().to_owned(), true)
                            }
                            ConversationRole::Choosee => {
                                (conversation_id.get_chooser_hash().to_owned(), false)
                            }
                            ConversationRole::NotInConversation => return,
                        };

                    let user_event = UserEvent::Message(TextMessageData {
                        conversation_id: conversation_id.to_string(),
                        content: content.clone(),
                        sent_at: DateTime::<Utc>::default(),
                    });

                    let nats_message = NatsMessage {
                        to_username_hash,
                        user_event,
                    };

                    tokio::task::spawn(async move {
                        let _ = nc
                            .publish(nats_message.subject(), nats_message.data())
                            .await
                            .map_err(|err| {
                                error!(
                                    "Error while publishing message user event to nats: {}",
                                    err
                                );
                            });
                    });

                    let _ = db
                        .new_message(&conversation_id.to_string(), &content, from_chooser)
                        .await;
                }

                UserOperation::Messages {
                    conversation_id,
                    take,
                    after_sent_at,
                } => {
                    let conversation_id = ConversationId::from(conversation_id);

                    if conversation_id.get_role_of_username(&username)
                        == ConversationRole::NotInConversation
                    {
                        return;
                    }

                    match db
                        .get_messages(&conversation_id.to_string(), after_sent_at)
                        .await
                    {
                        Ok(messages) => {
                            if let Err(err) = user_tx
                                .lock()
                                .await
                                .send(Message::Text(TextMessage::vec_to_string(messages)))
                                .await
                            {
                                let _ = err_tx.send(err.into()); // ignoring error because loop could've already closed
                            }
                        }
                        Err(_) => {
                            if let Err(err) = user_tx
                                .lock()
                                .await
                                .send(Message::Text(
                                    ErrorResponse("Failed to get messages for this conversation")
                                        .to_string(),
                                ))
                                .await
                            {
                                let _ = err_tx.send(err.into());
                            }
                        }
                    }
                }
                UserOperation::RegisterPresenceChoosee {
                    conversation_id,
                    leaving,
                } => {
                    let conversation_id = ConversationId::from(conversation_id);

                    if conversation_id.get_role_of_username(&username)
                        == ConversationRole::NotInConversation
                    {
                        return;
                    }

                    todo!()
                    // db.update_choosee_last_presence_at(choosee_username, created_at)
                }
            }
        });
    }
}
