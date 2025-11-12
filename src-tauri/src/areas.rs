use anyhow::Result;
use chrono::Utc;
use exemplar::Model;
use rusqlite::params;
use serde::{Deserialize, Serialize};

use crate::{AppState, HasId, generate_id, get_user_id_from_token, try_insert_thing};

#[derive(Debug, PartialEq, Serialize, Deserialize, Model)]
#[table("areas")]
#[check("../sql/areas.sql")]
pub struct Area {
    pub id: Option<String>,
    pub user_id: String,
    pub name: String,
    pub image_url: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

impl HasId for Area {
    fn id_mut(&mut self) -> &mut Option<String> {
        &mut self.id
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateAreaRequest {
    pub name: String,
    pub image_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateAreaRequest {
    pub name: String,
    pub image_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AreaResponse {
    pub success: bool,
    pub message: Option<String>,
    pub area: Option<AreaInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AreaInfo {
    pub id: String,
    pub name: String,
    pub image_url: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[tauri::command]
pub fn create_area(
    token: String,
    json: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Get user_id from token
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Parse request
    let request: CreateAreaRequest = serde_json::from_str(&json).map_err(|e| {
        println!("JSON parse error: {}", e);
        println!("JSON: {}", json);
        anyhow::Error::from(e)
    })?;

    // Validate name
    if request.name.trim().is_empty() {
        let error_response = AreaResponse {
            success: false,
            message: Some("Area name cannot be empty".to_string()),
            area: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Create area
    let now = Utc::now().timestamp();
    let mut area = Area {
        id: None,
        user_id: user_id.clone(),
        name: request.name.trim().to_string(),
        image_url: request.image_url,
        created_at: now,
        updated_at: now,
    };

    let area_id = try_insert_thing(&mut area, &conn)?;
    println!("inserted Area id: {:?}", area_id);

    let response = AreaResponse {
        success: true,
        message: None,
        area: Some(AreaInfo {
            id: area_id,
            name: area.name,
            image_url: area.image_url,
            created_at: area.created_at,
            updated_at: area.updated_at,
        }),
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}

#[tauri::command]
pub fn get_areas(token: String, state: tauri::State<'_, AppState>) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Get user_id from token
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Get all areas for user
    let mut stmt = conn.prepare(
        "SELECT id, name, image_url, created_at, updated_at FROM areas WHERE user_id = ?1 ORDER BY created_at DESC"
    ).map_err(anyhow::Error::from)?;

    let areas: Result<Vec<AreaInfo>, _> = stmt
        .query_map(params![user_id], |row| {
            Ok(AreaInfo {
                id: row.get(0)?,
                name: row.get(1)?,
                image_url: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(anyhow::Error::from)?
        .collect();

    let areas = areas.map_err(anyhow::Error::from)?;

    Ok(serde_json::to_string(&areas).map_err(anyhow::Error::from)?)
}

#[tauri::command]
pub fn update_area(
    token: String,
    id: String,
    json: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Get user_id from token
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Parse request
    let request: UpdateAreaRequest = serde_json::from_str(&json).map_err(|e| {
        println!("JSON parse error: {}", e);
        println!("JSON: {}", json);
        anyhow::Error::from(e)
    })?;

    // Validate name
    if request.name.trim().is_empty() {
        let error_response = AreaResponse {
            success: false,
            message: Some("Area name cannot be empty".to_string()),
            area: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Check if area exists and belongs to user
    let area_user_id: String = conn
        .query_row(
            "SELECT user_id FROM areas WHERE id = ?1",
            params![id],
            |row| row.get(0),
        )
        .map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("Area not found")))?;

    if area_user_id != user_id {
        let error_response = AreaResponse {
            success: false,
            message: Some("You don't have permission to update this area".to_string()),
            area: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Update area
    let now = Utc::now().timestamp();
    conn.execute(
        "UPDATE areas SET name = ?1, image_url = ?2, updated_at = ?3 WHERE id = ?4",
        params![request.name.trim(), request.image_url, now, id],
    )
    .map_err(anyhow::Error::from)?;

    // Get updated area
    let area_info: AreaInfo = conn
        .query_row(
            "SELECT id, name, image_url, created_at, updated_at FROM areas WHERE id = ?1",
            params![id],
            |row| {
                Ok(AreaInfo {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    image_url: row.get(2)?,
                    created_at: row.get(3)?,
                    updated_at: row.get(4)?,
                })
            },
        )
        .map_err(anyhow::Error::from)?;

    let response = AreaResponse {
        success: true,
        message: None,
        area: Some(area_info),
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}

#[tauri::command]
pub fn get_area_by_id(
    token: String,
    id: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Get user_id from token
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Get area by id
    let area_info: Result<AreaInfo, _> = conn.query_row(
        "SELECT id, name, image_url, created_at, updated_at FROM areas WHERE id = ?1 AND user_id = ?2",
        params![id, user_id],
        |row| {
            Ok(AreaInfo {
                id: row.get(0)?,
                name: row.get(1)?,
                image_url: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        },
    );

    match area_info {
        Ok(area) => Ok(serde_json::to_string(&area).map_err(anyhow::Error::from)?),
        Err(_) => Err(tauri::Error::Anyhow(anyhow::anyhow!("Area not found"))),
    }
}

#[tauri::command]
pub fn delete_area(
    token: String,
    id: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Get user_id from token
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Check if area exists and belongs to user
    let area_user_id: String = conn
        .query_row(
            "SELECT user_id FROM areas WHERE id = ?1",
            params![id],
            |row| row.get(0),
        )
        .map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("Area not found")))?;

    if area_user_id != user_id {
        let error_response = AreaResponse {
            success: false,
            message: Some("You don't have permission to delete this area".to_string()),
            area: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Delete area
    conn.execute("DELETE FROM areas WHERE id = ?1", params![id])
        .map_err(anyhow::Error::from)
        .map_err(tauri::Error::from)?;

    let response = AreaResponse {
        success: true,
        message: Some("Area deleted successfully".to_string()),
        area: None,
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}
