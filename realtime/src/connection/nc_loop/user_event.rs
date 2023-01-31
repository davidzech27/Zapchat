use chrono::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TextMessageData {
    pub conversation_id: String,
    pub content: String,
    pub sent_at: DateTime<Utc>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PresenceData {
    pub conversation_id: String,
    pub leaving: bool,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Deserialize, Serialize)]
#[serde(tag = "op", content = "d", rename_all = "camelCase")]
pub enum UserEvent {
    Chosen(TextMessageData),
    Message(TextMessageData),
    ChooseePresence(PresenceData),
}

impl UserEvent {
    pub fn to_vec(&self) -> Vec<u8> {
        serde_json::to_vec(self).unwrap()
    }

    pub fn to_string(&self) -> String {
        serde_json::to_string(self).unwrap()
    }

    pub fn from_slice(slice: &[u8]) -> Result<Self, ()> {
        serde_json::from_slice::<Self>(slice).map_err(|_| ())
    }
}
