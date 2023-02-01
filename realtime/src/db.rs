use thiserror::Error;

use chrono::prelude::*;
use scylla::prepared_statement::PreparedStatement;

use crate::connection::ws_loop::response::TextMessage;

pub mod conversation_id;

const TIMESTAMP_FORMAT: &str = "%Y-%m-%d %H:%M:%S";

pub struct Database {
    db: scylla::Session,
    new_conversation_query: PreparedStatement,
    new_message_query: PreparedStatement,
    update_choosee_last_presence_at_query: PreparedStatement,
    get_messages_query: PreparedStatement,
}

#[derive(Debug, Error)]
#[error("{0}")]
pub struct DatabaseError(String);

impl Database {
    pub async fn build(
        known_node_hostname: &str,
        username: &str,
        password: &str,
        keyspace: &str,
    ) -> Result<Self, scylla::transport::errors::NewSessionError> {
        let db = scylla::SessionBuilder::new()
            .known_node(known_node_hostname)
            .user(username, password)
            .use_keyspace(keyspace, true)
            .build()
            .await?;

        let mut new_conversation_query = db.prepare("INSERT INTO conversation (chooser_username, choosee_username, id, created_at) values (?, ?, ?, ?)").await.expect("New conversation prepared query failed");
        new_conversation_query.set_is_idempotent(true);

        let mut new_message_query = db.prepare("INSERT INTO message (conversation_id, content, sent_at, from_chooser) values (?, ?, ?, ?)").await.expect("New message prepared query failed");
        new_message_query.set_is_idempotent(true);

        let mut update_choosee_last_presence_at_query = db
            .prepare("UPDATE conversation SET choosee_last_presence_at = ? WHERE choosee_username = ? AND created_at = ?")
            .await
            .expect("Update choosee last presence prepared query failed");
        update_choosee_last_presence_at_query.set_is_idempotent(true);

        let mut get_messages_query = db
            .prepare(
                "SELECT content, sent_at, from_chooser FROM message WHERE conversation_id = ? AND sent_at > ? LIMIT ?",
            )
            .await
            .expect("Get messages prepared query failed");
        get_messages_query.set_is_idempotent(true);

        Ok(Database {
            db,
            new_conversation_query,
            new_message_query,
            update_choosee_last_presence_at_query,
            get_messages_query,
        })
    }

    pub async fn new_conversation(
        &self,
        chooser_username: &str,
        choosee_username: &str,
        conversation_id: &str,
    ) -> Result<(), DatabaseError> {
        self.db
            .execute(
                &self.new_conversation_query,
                (
                    chooser_username,
                    choosee_username,
                    conversation_id.to_string(),
                    Self::current_timestamp(),
                ),
            )
            .await
            .map(|_| ())
            .map_err(|err| DatabaseError(format!("Error creating new conversation: {}", err)))
    }

    pub async fn new_message(
        &self,
        conversation_id: &str,
        content: &str,
        from_chooser: bool,
    ) -> Result<(), DatabaseError> {
        self.db
            .execute(
                &self.new_message_query,
                (
                    conversation_id,
                    content,
                    Self::current_timestamp(),
                    from_chooser,
                ),
            )
            .await
            .map(|_| ())
            .map_err(|err| DatabaseError(format!("Error creating new message: {}", err)))
    }

    pub async fn update_choosee_last_presence_at(
        &self,
        choosee_username: &str,
        created_at: DateTime<Utc>,
    ) -> Result<(), DatabaseError> {
        self.db
            .execute(
                &self.update_choosee_last_presence_at_query,
                (
                    Self::current_timestamp(),
                    choosee_username,
                    Self::timestamp_from_datetime(created_at),
                ),
            )
            .await
            .map(|_| ())
            .map_err(|err| {
                DatabaseError(format!("Error updating choosee_last_presence_at: {}", err))
            })
    }

    pub async fn get_messages(
        &self,
        conversation_id: &str,
        take: i8,
        after_sent_at: DateTime<Utc>,
    ) -> Result<Vec<TextMessage>, DatabaseError> {
        let mut message_vec = Vec::<TextMessage>::new();

        for row in self
            .db
            .execute(
                &self.get_messages_query,
                (
                    conversation_id,
                    Self::timestamp_from_datetime(after_sent_at),
                    take,
                ),
            )
            .await
            .map_err(|err| DatabaseError(format!("Error getting messages: {}", err)))?
            .rows_typed_or_empty::<(String, String, bool)>()
        {
            let row =
                row.map_err(|err| DatabaseError(format!("Error getting messages: {}", err)))?;

            message_vec.push(TextMessage {
                content: row.0,
                sent_at: Self::datetime_from_timestamp(&row.1),
                from_chooser: row.2,
            });
        }

        Ok(message_vec)
    }

    fn current_timestamp() -> String {
        DateTime::<Utc>::default()
            .format(TIMESTAMP_FORMAT)
            .to_string()
    }

    fn timestamp_from_datetime(datetime: DateTime<Utc>) -> String {
        datetime.format(TIMESTAMP_FORMAT).to_string()
    }

    fn datetime_from_timestamp(timestamp: &str) -> DateTime<Utc> {
        DateTime::parse_from_str(timestamp, TIMESTAMP_FORMAT)
            .expect("Timestamp formatted incorrectly")
            .into()
    }
}
