use futures_util::StreamExt;
use std::sync::Arc;
use tokio::net::TcpStream;
use tokio::sync::{mpsc, Mutex};
use tokio_tungstenite::WebSocketStream;

use crate::db::Database;
use crate::hash;
use nc_loop::NcLoop;
use ws_loop::WsLoop;

use self::error::FatalConnectionError;

// handles connection and closing it but caller handles printing error

// only unwrap when stringifying struct

pub mod error;
mod nc_loop;
pub mod ws_loop;

pub struct Connection {
    pub websocket: WebSocketStream<TcpStream>,
    pub db: Arc<Database>,
    pub nc: Arc<nats::asynk::Connection>,
    pub phone_number: i64,
    pub username: String,
}

impl Connection {
    pub async fn handle(self) -> Result<(), FatalConnectionError> {
        let (user_tx, user_rx) = self.websocket.split();
        let user_tx = Arc::new(Mutex::new(user_tx));

        let (task_result_tx, mut task_result_rx) =
            mpsc::channel::<Result<(), FatalConnectionError>>(1);
        let task_result_tx_clone = task_result_tx.clone();

        let (nc_loop_cancel_tx, nc_loop_cancel_rx) = mpsc::channel::<()>(1);
        let (ws_loop_cancel_tx, ws_loop_cancel_rx) = mpsc::channel::<()>(1);

        let nc_loop = NcLoop {
            user_tx: user_tx.clone(),
            nc: self.nc.clone(),
            username_hash: hash::base64_encoded_md5_hash_with_secret(self.username.clone()),
        };

        let ws_loop = WsLoop {
            user_rx,
            user_tx,
            db: self.db,
            nc: self.nc,
            username: self.username,
        };

        tokio::task::spawn(async move {
            let result = nc_loop.handle(nc_loop_cancel_rx).await;

            let _ = ws_loop_cancel_tx.send(()).await; // will return error if other task completed first because sender will have been dropped, so we'll ignore this error

            let _ = task_result_tx.send(result).await; // same as above ^^^
        });

        tokio::task::spawn(async move {
            let result = ws_loop.handle(ws_loop_cancel_rx).await;

            let _ = nc_loop_cancel_tx.send(()).await;

            let _ = task_result_tx_clone.send(result).await;
        });

        task_result_rx.recv().await.unwrap() // senders won't drop until after sending to this channel
    }
}
