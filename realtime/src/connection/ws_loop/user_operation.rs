use chrono::prelude::*;
use serde::{Deserialize, Serialize};

use crate::connection::error::UnsupportedFormatError;

#[derive(Deserialize, Serialize)]
#[serde(tag = "op", content = "d", rename_all = "camelCase")]
pub enum UserOperation {
    Choose {
        content: String,
        choosee_username: String,
    },
    Send {
        content: String,
        conversation_id: String,
    },
    Messages {
        conversation_id: String,
        take: i8,
        after_sent_at: DateTime<Utc>,
    },
    RegisterPresenceChoosee {
        conversation_id: String,
        leaving: bool,
    },
}

impl UserOperation {
    pub fn from_str(str: &str) -> Result<Self, UnsupportedFormatError> {
        Ok(serde_json::from_str(str)?)
    }
}
