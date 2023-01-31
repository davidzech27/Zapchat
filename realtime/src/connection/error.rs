use thiserror::Error;

#[derive(Error, Debug)]
pub enum ConnectionError {
    #[error("Websocket error: {0}")]
    WebSocketError(#[from] tungstenite::Error),
    #[error("Unexpected close frame: {0}")]
    UnexpectedClose(String),
    #[error("Received unexpected message format: {0}")]
    UnsupportedFormat(String),
    #[error("Nats error: {0}")]
    NcError(#[from] std::io::Error),
    #[error("Nats subscription terminated unexpectedly")]
    UnexpectedNcSubTerminate,
}
