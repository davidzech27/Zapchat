use futures_util::{stream::SplitSink, SinkExt};
use std::sync::Arc;
use tokio::net::TcpStream;
use tokio::sync::{mpsc, Mutex};
use tokio_tungstenite::WebSocketStream;
use tungstenite::Message;

use self::user_event::UserEvent;
use super::error::FatalConnectionError;
use nats_message::NatsMessage;

pub mod nats_message;
pub mod user_event;

pub struct NcLoop {
    pub user_tx: Arc<Mutex<SplitSink<WebSocketStream<TcpStream>, Message>>>,
    pub nc: Arc<nats::asynk::Connection>,
    pub username_hash: String,
}

impl NcLoop {
    pub async fn handle(
        mut self,
        mut cancel_rx: mpsc::Receiver<()>,
    ) -> Result<(), FatalConnectionError> {
        let message_sub = self.nc.subscribe(&self.username_hash).await?;

        while let Some(nats_message) = tokio::select! {
            next = message_sub.next() => next,
            _ = cancel_rx.recv() => return Ok(()),
        } {
            match NatsMessage::from(nats_message) {
                Ok(NatsMessage {
                    to_username_hash: _,
                    user_event,
                }) => {
                    self.handle_user_event(user_event).await?;
                }
                Err(err) => {
                    warn!("Invalid nats message received: {}", err);

                    continue;
                }
            }
        }

        Err(FatalConnectionError::UnexpectedNatsSubscriptionTerminate) // will only get to this when message_sub returns none. this line won't run if nc_loop is canceled
    }

    pub async fn handle_user_event(&mut self, data: UserEvent) -> Result<(), FatalConnectionError> {
        self.user_tx
            .lock()
            .await
            .send(Message::Text(data.to_string()))
            .await?;

        Ok(())
    }
}
