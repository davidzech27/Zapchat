use chrono::{prelude::*, Duration};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;
use tungstenite::http::{Request, Response, StatusCode};
extern crate tracing_subscriber;
#[macro_use]
extern crate tracing;

use auth::{AccessTokenPayload, JWTAuth};
use connection::Connection;
use init::Init;

mod auth;
mod connection;
mod init;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let Init {
        nc,
        port,
        access_token_secret,
    } = Init::init().await;

    let server_addr = SocketAddr::from(([127, 0, 0, 1], port));

    let server = TcpListener::bind(server_addr)
        .await
        .expect("Failed to bind");

    info!(
        "Listening on {}",
        server
            .local_addr()
            .expect("Error getting address server is listening on")
    );

    let jwt_auth = Arc::new(JWTAuth::new(&access_token_secret));

    loop {
        let nc = nc.clone();

        let jwt_auth = jwt_auth.clone();

        match server.accept().await {
            Ok((stream, _addr)) => {
                tokio::task::spawn(async move {
                    let mut access_token_payload: Option<AccessTokenPayload> = None;

                    match tokio_tungstenite::accept_hdr_async(
                        stream,
                        |req: &Request<()>, mut res: Response<()>| {
                            return match jwt_auth.veryify_req(req) {
                                Ok(payload) => {
                                    access_token_payload = Some(payload);

                                    Ok(res)
                                }
                                Err(_) => {
                                    *res.status_mut() = StatusCode::UNAUTHORIZED;

                                    Err(Response::from_parts(
                                        res.into_parts().0,
                                        Some("Valid access token required".to_owned()),
                                    ))
                                }
                            };
                        },
                    )
                    .await
                    {
                        Ok(websocket) => {
                            let access_token_payload = access_token_payload.expect("This error should not happen because access_token_payload should be set if websocket handshake is successful");

                            let conn = Connection {
                                nc,
                                websocket,
                                phone_number: access_token_payload.phone_number,
                            };

                            let start_time = Utc::now();

                            let connection_result = conn.handle().await;

                            let seconds_elapsed =
                                Utc::now().signed_duration_since(start_time).num_seconds();

                            info!("username: {}, phone_number: {}, seconds_elapsed: {}, nats_err, {:?}, websocket_err: {:?}, websocket_close_err: {:?}",
                                access_token_payload.username,
                                access_token_payload.phone_number,
                                seconds_elapsed,
                                &connection_result.nats_err,
                                &connection_result.websocket_err,
                                &connection_result.websocket_close_err
                            );
                        }
                        Err(err) => {
                            error!("Error during websocket handshake: {}", err);
                        }
                    }
                });
            }
            Err(err) => {
                error!("Error accepting tcp connection: {}", err);
                continue;
            }
        }
    }
}
