use anyhow::Result;
use base64::Engine;
use chrono::Utc;
use exemplar::Model;
use rusqlite::params;
use serde::{Deserialize, Serialize};

use crate::{AppState, HasId, generate_id, get_user_id_from_token, try_insert_thing};

#[derive(Debug, PartialEq, Serialize, Deserialize, Model)]
#[table("resources")]
#[check("../sql/resources.sql")]
pub struct Resource {
    pub id: Option<String>,
    pub user_id: String,
    pub project_id: String,
    pub name: String,
    pub content: Option<String>,   // For text documents
    pub file_data: Option<String>, // Base64 encoded file data
    pub file_type: Option<String>, // MIME type or file extension
    pub file_size: Option<i64>,    // Size in bytes
    pub created_at: i64,
    pub updated_at: i64,
}

impl HasId for Resource {
    fn id_mut(&mut self) -> &mut Option<String> {
        &mut self.id
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateResourceRequest {
    pub project_id: String,
    pub name: String,
    pub content: Option<String>,
    pub file_data: Option<String>,
    pub file_type: Option<String>,
    pub file_size: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateResourceRequest {
    pub name: String,
    pub content: Option<String>,
    pub file_data: Option<String>,
    pub file_type: Option<String>,
    pub file_size: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResourceResponse {
    pub success: bool,
    pub message: Option<String>,
    pub resource: Option<ResourceInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResourceInfo {
    pub id: String,
    pub project_id: String,
    pub project_name: Option<String>,
    pub name: String,
    pub content: Option<String>,
    pub file_data: Option<String>,
    pub file_type: Option<String>,
    pub file_size: Option<i64>,
    pub created_at: i64,
    pub updated_at: i64,
}

const MAX_FILE_SIZE: i64 = 5 * 1024 * 1024; // 5MB in bytes

#[tauri::command(rename_all = "snake_case")]
pub fn create_resource(
    token: String,
    json: String,
    state: tauri::State<AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Parse request
    let request: CreateResourceRequest = serde_json::from_str(&json).map_err(|e| {
        println!("JSON parse error: {}", e);
        println!("JSON: {}", json);
        anyhow::Error::from(e)
    })?;

    // Validate file size if provided
    if let Some(size) = request.file_size {
        if size > MAX_FILE_SIZE {
            let error_response = ResourceResponse {
                success: false,
                message: Some("File size exceeds maximum of 5MB".to_string()),
                resource: None,
            };
            return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
        }
    }

    // Validate that project belongs to user
    let project_exists: bool = conn
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM projects WHERE id = ?1 AND user_id = ?2)",
            params![request.project_id, user_id],
            |row| row.get(0),
        )
        .map_err(anyhow::Error::from)?;

    if !project_exists {
        let error_response = ResourceResponse {
            success: false,
            message: Some("Project not found".to_string()),
            resource: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    let now = Utc::now().timestamp();
    let mut resource = Resource {
        id: None,
        user_id: user_id.clone(),
        project_id: request.project_id,
        name: request.name,
        content: request.content,
        file_data: request.file_data,
        file_type: request.file_type,
        file_size: request.file_size,
        created_at: now,
        updated_at: now,
    };

    let resource_id = try_insert_thing(&mut resource, &conn)?;

    let response = ResourceResponse {
        success: true,
        message: Some("Resource created successfully".to_string()),
        resource: Some(ResourceInfo {
            id: resource_id,
            project_id: resource.project_id,
            project_name: None,
            name: resource.name,
            content: resource.content,
            file_data: resource.file_data,
            file_type: resource.file_type,
            file_size: resource.file_size,
            created_at: resource.created_at,
            updated_at: resource.updated_at,
        }),
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_resources(
    token: String,
    project_id: Option<String>,
    state: tauri::State<AppState>,
) -> Result<Vec<ResourceInfo>, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;
    let user_id = get_user_id_from_token(&token, &conn)?;

    let resources = if let Some(pid) = project_id {
        // Get resources for a specific project
        let mut stmt = conn
            .prepare(
                "SELECT r.id, r.project_id, r.name, r.content, r.file_data, r.file_type, r.file_size, r.created_at, r.updated_at, p.title as project_name
                 FROM resources r
                 LEFT JOIN projects p ON r.project_id = p.id
                 WHERE r.user_id = ?1 AND r.project_id = ?2
                 ORDER BY r.created_at DESC",
            )
            .map_err(anyhow::Error::from)?;

        let rows = stmt
            .query_map(params![user_id, pid], |row| {
                Ok(ResourceInfo {
                    id: row.get(0)?,
                    project_id: row.get(1)?,
                    project_name: row.get(9)?,
                    name: row.get(2)?,
                    content: row.get(3)?,
                    file_data: row.get(4)?,
                    file_type: row.get(5)?,
                    file_size: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                })
            })
            .map_err(anyhow::Error::from)?
            .collect::<Result<Vec<_>, _>>()
            .map_err(anyhow::Error::from)?;

        rows
    } else {
        // Get all resources for the user
        let mut stmt = conn
            .prepare(
                "SELECT r.id, r.project_id, r.name, r.content, r.file_data, r.file_type, r.file_size, r.created_at, r.updated_at, p.title as project_name
                 FROM resources r
                 LEFT JOIN projects p ON r.project_id = p.id
                 WHERE r.user_id = ?1
                 ORDER BY r.created_at DESC",
            )
            .map_err(anyhow::Error::from)?;

        let rows = stmt
            .query_map(params![user_id], |row| {
                Ok(ResourceInfo {
                    id: row.get(0)?,
                    project_id: row.get(1)?,
                    project_name: row.get(9)?,
                    name: row.get(2)?,
                    content: row.get(3)?,
                    file_data: row.get(4)?,
                    file_type: row.get(5)?,
                    file_size: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                })
            })
            .map_err(anyhow::Error::from)?
            .collect::<Result<Vec<_>, _>>()
            .map_err(anyhow::Error::from)?;

        rows
    };

    Ok(resources)
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_resource_by_id(
    token: String,
    id: String,
    state: tauri::State<AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;
    let user_id = get_user_id_from_token(&token, &conn)?;

    let resource: ResourceInfo = conn
        .query_row(
            "SELECT r.id, r.project_id, r.name, r.content, r.file_data, r.file_type, r.file_size, r.created_at, r.updated_at, p.title as project_name
             FROM resources r
             LEFT JOIN projects p ON r.project_id = p.id
             WHERE r.id = ?1 AND r.user_id = ?2",
            params![id, user_id],
            |row| {
                Ok(ResourceInfo {
                    id: row.get(0)?,
                    project_id: row.get(1)?,
                    project_name: row.get(9)?,
                    name: row.get(2)?,
                    content: row.get(3)?,
                    file_data: row.get(4)?,
                    file_type: row.get(5)?,
                    file_size: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                })
            },
        )
        .map_err(|e| {
            if e.to_string().contains("Query returned no rows") {
                tauri::Error::Anyhow(anyhow::anyhow!("Resource not found"))
            } else {
                tauri::Error::Anyhow(anyhow::Error::from(e))
            }
        })?;

    Ok(serde_json::to_string(&resource).map_err(anyhow::Error::from)?)
}

#[tauri::command(rename_all = "snake_case")]
pub fn update_resource(
    token: String,
    id: String,
    json: String,
    state: tauri::State<AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Parse request
    let request: UpdateResourceRequest = serde_json::from_str(&json).map_err(|e| {
        println!("JSON parse error: {}", e);
        println!("JSON: {}", json);
        anyhow::Error::from(e)
    })?;

    // Validate file size if provided
    if let Some(size) = request.file_size {
        if size > MAX_FILE_SIZE {
            let error_response = ResourceResponse {
                success: false,
                message: Some("File size exceeds maximum of 5MB".to_string()),
                resource: None,
            };
            return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
        }
    }

    // Check if resource exists and belongs to user
    let resource_exists: bool = conn
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM resources WHERE id = ?1 AND user_id = ?2)",
            params![id, user_id],
            |row| row.get(0),
        )
        .map_err(anyhow::Error::from)?;

    if !resource_exists {
        let error_response = ResourceResponse {
            success: false,
            message: Some("Resource not found".to_string()),
            resource: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    let now = Utc::now().timestamp();
    conn.execute(
        "UPDATE resources SET name = ?1, content = ?2, file_data = ?3, file_type = ?4, file_size = ?5, updated_at = ?6 WHERE id = ?7 AND user_id = ?8",
        params![
            request.name,
            request.content,
            request.file_data,
            request.file_type,
            request.file_size,
            now,
            id,
            user_id
        ],
    )
    .map_err(anyhow::Error::from)?;

    // Fetch updated resource
    let resource: ResourceInfo = conn
        .query_row(
            "SELECT r.id, r.project_id, r.name, r.content, r.file_data, r.file_type, r.file_size, r.created_at, r.updated_at, p.title as project_name
             FROM resources r
             LEFT JOIN projects p ON r.project_id = p.id
             WHERE r.id = ?1 AND r.user_id = ?2",
            params![id, user_id],
            |row| {
                Ok(ResourceInfo {
                    id: row.get(0)?,
                    project_id: row.get(1)?,
                    project_name: row.get(9)?,
                    name: row.get(2)?,
                    content: row.get(3)?,
                    file_data: row.get(4)?,
                    file_type: row.get(5)?,
                    file_size: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                })
            },
        )
        .map_err(anyhow::Error::from)?;

    let response = ResourceResponse {
        success: true,
        message: Some("Resource updated successfully".to_string()),
        resource: Some(resource),
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}

#[tauri::command(rename_all = "snake_case")]
pub fn delete_resource(
    token: String,
    id: String,
    state: tauri::State<AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;
    let user_id = get_user_id_from_token(&token, &conn)?;

    let rows_affected = conn
        .execute(
            "DELETE FROM resources WHERE id = ?1 AND user_id = ?2",
            params![id, user_id],
        )
        .map_err(anyhow::Error::from)?;

    if rows_affected == 0 {
        return Err(tauri::Error::Anyhow(anyhow::anyhow!("Resource not found")));
    }

    Ok(id)
}

#[tauri::command(rename_all = "snake_case")]
pub fn download_resource_file(
    token: String,
    id: String,
    state: tauri::State<AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;
    let user_id = get_user_id_from_token(&token, &conn)?;

    let (file_data, file_name, file_type): (Option<String>, String, Option<String>) = conn
        .query_row(
            "SELECT file_data, name, file_type FROM resources WHERE id = ?1 AND user_id = ?2",
            params![id, user_id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .map_err(|e| {
            if e.to_string().contains("Query returned no rows") {
                tauri::Error::Anyhow(anyhow::anyhow!("Resource not found"))
            } else {
                tauri::Error::Anyhow(anyhow::Error::from(e))
            }
        })?;

    if let Some(base64_data) = file_data {
        // Show save dialog using rfd
        let mut dialog = rfd::FileDialog::new().set_file_name(&file_name);

        // Add file filter if we have a file type
        if let Some(ft) = &file_type {
            if let Some(ext) = ft.split('/').last() {
                if !ext.is_empty() {
                    dialog = dialog.add_filter("File", &[ext]);
                }
            }
        }

        if let Some(file_path) = dialog.save_file() {
            // Decode base64
            let decoded = base64::engine::general_purpose::STANDARD
                .decode(&base64_data)
                .map_err(|e| {
                    tauri::Error::Anyhow(anyhow::anyhow!("Failed to decode base64: {}", e))
                })?;

            // Write to file
            std::fs::write(&file_path, decoded).map_err(|e| {
                tauri::Error::Anyhow(anyhow::anyhow!("Failed to write file: {}", e))
            })?;

            Ok(file_path.to_string_lossy().to_string())
        } else {
            Err(tauri::Error::Anyhow(anyhow::anyhow!(
                "User cancelled file save dialog"
            )))
        }
    } else {
        Err(tauri::Error::Anyhow(anyhow::anyhow!(
            "No file data available"
        )))
    }
}
