use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Serialize, Deserialize)]
pub struct TextMessage {
    pub content: String,
    pub sent_at: DateTime<Utc>,
    pub from_chooser: bool,
}

#[derive(Serialize)]
pub struct TextMessageVec(Vec<TextMessage>);

impl TextMessage {
    pub fn vec_to_string(text_message_vec: Vec<Self>) -> String {
        serde_json::to_string(&TextMessageVec(text_message_vec)).unwrap()
    }
}

pub struct ErrorResponse<'a>(pub &'a str);

impl<'a> ErrorResponse<'a> {
    pub fn to_string(self) -> String {
        serde_json::to_string(&json!({
            "error": self.0
        }))
        .unwrap()
    }
}
