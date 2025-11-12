mod areas;
mod auth;
mod projects;
mod resources;

use anyhow::Result;
use chrono::Utc;
use exemplar::Model;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rand::Rng;
use rusqlite::params;
use serde::{Deserialize, Serialize};

// Trait for safe access to id field
pub trait HasId {
    fn id_mut(&mut self) -> &mut Option<String>;
}

// Macro to implement HasId for any struct with an id: Option<String> field
macro_rules! impl_has_id {
    ($t:ty) => {
        impl HasId for $t {
            fn id_mut(&mut self) -> &mut Option<String> {
                &mut self.id
            }
        }
    };
}

// Utility function to generate 6-letter alphanumeric codes
pub fn generate_id() -> String {
    const CHARSET: &[u8] = b"ACDEFHJKLMNPQRTUVWXY0123456789";
    let mut rng = rand::rng();
    (0..8)
        .map(|_| {
            let idx = rng.random_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}

pub struct AppState {
    pub pool: Pool<SqliteConnectionManager>,
}

// Helper function to get user_id from token
pub fn get_user_id_from_token(
    token: &str,
    conn: &rusqlite::Connection,
) -> Result<String, tauri::Error> {
    let now = Utc::now().timestamp();
    let user_id: String = conn
        .query_row(
            "SELECT user_id FROM sessions WHERE token = ?1 AND expires_at > ?2",
            params![token, now],
            |row| row.get(0),
        )
        .map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("Invalid or expired token")))?;
    Ok(user_id)
}

// Helper function to insert a model instance with retry logic for UNIQUE constraint failures
pub fn try_insert_thing<T: exemplar::Model + HasId>(
    thing: &mut T,
    conn: &rusqlite::Connection,
) -> Result<String, tauri::Error> {
    let attempts = 3;
    for i in 0..attempts {
        // Only call id_mut() once per loop iteration
        {
            let id_mut = thing.id_mut();
            if id_mut.is_none() || id_mut.as_ref().map_or(false, |id| id.len() < 6) {
                *id_mut = Some(generate_id());
            }
        }
        // Now use immutable borrow for the rest
        match exemplar::Model::insert(thing, conn) {
            Ok(_) => {
                let id_ref = thing.id_mut(); // safe to call again
                if let Some(id) = id_ref.as_ref() {
                    return Ok(id.clone());
                } else {
                    return Err(tauri::Error::Anyhow(anyhow::anyhow!(
                        "ID is None after insert"
                    )));
                }
            }
            Err(e) if e.to_string().contains("UNIQUE constraint failed") => {
                println!("UNIQUE constraint failed on attempt {}: {}", i + 1, e);
                continue;
            }
            Err(e) => return Err(tauri::Error::Anyhow(anyhow::Error::from(e))),
        }
    }
    Err(tauri::Error::Anyhow(anyhow::anyhow!(
        "Failed to insert thing after {} attempts due to repeated UNIQUE constraint violations",
        attempts
    )))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(pool: Pool<SqliteConnectionManager>) {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            tauri::async_runtime::spawn(async move {});

            Ok(())
        })
        .manage(AppState { pool })
        .invoke_handler(tauri::generate_handler![
            auth::signup,
            auth::signin,
            auth::validate_token,
            auth::update_user,
            auth::change_password_with_token,
            auth::delete_session,
            areas::create_area,
            areas::get_areas,
            areas::get_area_by_id,
            areas::update_area,
            areas::delete_area,
            projects::create_project,
            projects::get_projects,
            projects::get_project_by_id,
            projects::update_project,
            projects::move_project,
            projects::delete_project,
            resources::create_resource,
            resources::get_resources,
            resources::get_resource_by_id,
            resources::update_resource,
            resources::delete_resource,
            resources::download_resource_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
