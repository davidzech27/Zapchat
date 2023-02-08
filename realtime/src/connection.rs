use futures_util::{
    stream::{SplitSink, SplitStream},
    SinkExt, StreamExt, TryStreamExt,
};
use nats::asynk::Message as NatsMessage;
use std::sync::Arc;
use tokio::net::TcpStream;
use tokio_tungstenite::WebSocketStream;
use tungstenite::{Error as WebSocketError, Message as WebSocketMessage};

pub struct Connection {
    pub nc: Arc<nats::asynk::Connection>,
    pub websocket: WebSocketStream<TcpStream>,
    pub username: String,
}
pub struct ConnectionResult {
    pub nats_err: Option<String>,
    pub websocket_err: Option<WebSocketError>,
    pub websocket_close_err: Option<WebSocketError>,
}

enum Message {
    NatsMessage(NatsMessage),
    WebSocketMessage(WebSocketMessage),
}

impl Connection {
    pub async fn handle(mut self) -> ConnectionResult {
        match self.nc.subscribe(&self.username).await {
            Ok(nats_message_sub) => loop {
                match tokio::select! {
                    nats_message = nats_message_sub.next() => match nats_message {
                        Some(nats_message) => Message::NatsMessage(nats_message),
                        None => {
                            return ConnectionResult {
                                nats_err: Some("Unexpected nats subscription termination".to_owned()),
                                websocket_err: None,
                                websocket_close_err: self.websocket.close(None).await.err(),
                            };
                        }
                    },
                    websocket_message_result = self.websocket.next() => match websocket_message_result {
                        Some(websocket_message_result) => match websocket_message_result {
                            Ok(websocket_message) => Message::WebSocketMessage(websocket_message),
                            Err(websocket_err) => {
                                let websocket_close_err = match websocket_err {
                                    WebSocketError::ConnectionClosed | WebSocketError::AlreadyClosed => None,
                                    _ => self.websocket.close(None).await.err()
                                };

                                return ConnectionResult {
                                    nats_err: None,
                                    websocket_err: Some(websocket_err),
                                    websocket_close_err,
                                }
                            },
                        }
                        None => {
                            error!("This probably shouldn't happen. By my understanding, when a websocket connection closes, the next received websocket message should be an error, which is handled by returning from this function, so the websocket stream should never be exhausted.");

                            return ConnectionResult {
                                nats_err: None,
                                websocket_err: None,
                                websocket_close_err: None,
                            }
                        }
                    }
                } {
                    Message::NatsMessage(nats_message) => {
                        match String::from_utf8(nats_message.data) {
                            Ok(nats_message_data) => {
                                if let Err(send_err) = self
                                    .websocket
                                    .send(WebSocketMessage::Text(nats_message_data))
                                    .await
                                {
                                    let websocket_close_err = match send_err {
                                        WebSocketError::ConnectionClosed
                                        | WebSocketError::AlreadyClosed => None,
                                        _ => self.websocket.close(None).await.err(),
                                    };

                                    return ConnectionResult {
                                        nats_err: None,
                                        websocket_err: Some(send_err),
                                        websocket_close_err,
                                    };
                                }
                            }
                            Err(utf8_err) => {
                                warn!("Received invalid utf8 in nats message: {}", utf8_err);
                            }
                        }
                    }
                    Message::WebSocketMessage(websocket_message) => {
                        warn!("Recieved websocket message, which probably shouldn't happen unless it's a ping: {}", websocket_message);
                    }
                }
            },
            Err(nats_err) => ConnectionResult {
                nats_err: Some(format!("Error subscribing to nats subject: {}", nats_err)),
                websocket_err: None,
                websocket_close_err: self.websocket.close(None).await.err(),
            },
        }
    }
}
