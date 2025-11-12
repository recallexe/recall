use anyhow::Result;
use chrono::Utc;
use exemplar::Model;
use rusqlite::params;
use serde::{Deserialize, Serialize};

use crate::{AppState, HasId, generate_id, get_user_id_from_token, try_insert_thing};

#[derive(Debug, PartialEq, Serialize, Deserialize, Model)]
#[table("projects")]
#[check("../sql/projects.sql")]
pub struct Project {
    pub id: Option<String>,
    pub user_id: String,
    pub area_id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub priority: Option<String>,
    pub start_date: Option<i64>,
    pub end_date: Option<i64>,
    pub created_at: i64,
    pub updated_at: i64,
}

impl HasId for Project {
    fn id_mut(&mut self) -> &mut Option<String> {
        &mut self.id
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProjectRequest {
    pub area_id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub priority: Option<String>,
    pub start_date: Option<i64>,
    pub end_date: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateProjectRequest {
    pub area_id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub priority: Option<String>,
    pub start_date: Option<i64>,
    pub end_date: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectResponse {
    pub success: bool,
    pub message: Option<String>,
    pub project: Option<ProjectInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectInfo {
    pub id: String,
    pub area_id: String,
    pub area_name: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub priority: Option<String>,
    pub start_date: Option<i64>,
    pub end_date: Option<i64>,
    pub created_at: i64,
    pub updated_at: i64,
}

fn validate_status(status: &str) -> bool {
    matches!(status, "Inbox" | "Planned" | "Progress" | "Done")
}

fn validate_priority(priority: &str) -> bool {
    matches!(priority, "High" | "Medium" | "Low")
}

#[tauri::command]
pub fn create_project(
    token: String,
    json: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Get user_id from token
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Parse request
    let request: CreateProjectRequest = serde_json::from_str(&json).map_err(|e| {
        println!("JSON parse error: {}", e);
        println!("JSON: {}", json);
        anyhow::Error::from(e)
    })?;

    // Validate
    if request.title.trim().is_empty() {
        let error_response = ProjectResponse {
            success: false,
            message: Some("Project title cannot be empty".to_string()),
            project: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    if !validate_status(&request.status) {
        let error_response = ProjectResponse {
            success: false,
            message: Some("Invalid status. Must be: Inbox, Planned, Progress, or Done".to_string()),
            project: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    if let Some(ref priority) = request.priority {
        if !validate_priority(priority) {
            let error_response = ProjectResponse {
                success: false,
                message: Some("Invalid priority. Must be: High, Medium, or Low".to_string()),
                project: None,
            };
            return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
        }
    }

    // Verify area belongs to user
    let area_user_id: String = conn
        .query_row(
            "SELECT user_id FROM areas WHERE id = ?1",
            params![request.area_id],
            |row| row.get(0),
        )
        .map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("Area not found")))?;

    if area_user_id != user_id {
        let error_response = ProjectResponse {
            success: false,
            message: Some("You don't have permission to create projects in this area".to_string()),
            project: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Create project
    let now = Utc::now().timestamp();
    let mut project = Project {
        id: None,
        user_id: user_id.clone(),
        area_id: request.area_id,
        title: request.title.trim().to_string(),
        description: request
            .description
            .map(|d| d.trim().to_string())
            .filter(|d| !d.is_empty()),
        status: request.status,
        priority: request.priority,
        start_date: request.start_date,
        end_date: request.end_date,
        created_at: now,
        updated_at: now,
    };

    let project_id = try_insert_thing(&mut project, &conn)?;
    println!("inserted Project id: {:?}", project_id);

    // Get area name for response
    let area_name: Option<String> = conn
        .query_row(
            "SELECT name FROM areas WHERE id = ?1",
            params![project.area_id],
            |row| row.get(0),
        )
        .ok();

    let response = ProjectResponse {
        success: true,
        message: None,
        project: Some(ProjectInfo {
            id: project_id,
            area_id: project.area_id,
            area_name,
            title: project.title,
            description: project.description,
            status: project.status,
            priority: project.priority,
            start_date: project.start_date,
            end_date: project.end_date,
            created_at: project.created_at,
            updated_at: project.updated_at,
        }),
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}

#[tauri::command]
pub fn get_projects(
    token: String,
    area_id: Option<String>,
    state: tauri::State<'_, AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Get user_id from token
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Build query and execute
    let projects: Vec<ProjectInfo> = if let Some(area_id) = area_id {
        // Verify area belongs to user
        let area_user_id: String = conn
            .query_row(
                "SELECT user_id FROM areas WHERE id = ?1",
                params![area_id],
                |row| row.get(0),
            )
            .map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("Area not found")))?;

        if area_user_id != user_id {
            return Err(tauri::Error::Anyhow(anyhow::anyhow!("Area not found")));
        }

        let mut stmt = conn
            .prepare(
                "SELECT p.id, p.area_id, a.name as area_name, p.title, p.description, p.status, p.priority, p.start_date, p.end_date, p.created_at, p.updated_at 
                 FROM projects p 
                 LEFT JOIN areas a ON p.area_id = a.id 
                 WHERE p.user_id = ?1 AND p.area_id = ?2 
                 ORDER BY p.created_at DESC",
            )
            .map_err(anyhow::Error::from)?;

        stmt.query_map(params![user_id, area_id], |row| {
            Ok(ProjectInfo {
                id: row.get(0)?,
                area_id: row.get(1)?,
                area_name: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                status: row.get(5)?,
                priority: row.get(6)?,
                start_date: row.get(7)?,
                end_date: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map_err(anyhow::Error::from)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(anyhow::Error::from)?
    } else {
        let mut stmt = conn
            .prepare(
                "SELECT p.id, p.area_id, a.name as area_name, p.title, p.description, p.status, p.priority, p.start_date, p.end_date, p.created_at, p.updated_at 
                 FROM projects p 
                 LEFT JOIN areas a ON p.area_id = a.id 
                 WHERE p.user_id = ?1 
                 ORDER BY p.created_at DESC",
            )
            .map_err(anyhow::Error::from)?;

        stmt.query_map(params![user_id], |row| {
            Ok(ProjectInfo {
                id: row.get(0)?,
                area_id: row.get(1)?,
                area_name: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                status: row.get(5)?,
                priority: row.get(6)?,
                start_date: row.get(7)?,
                end_date: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map_err(anyhow::Error::from)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(anyhow::Error::from)?
    };

    Ok(serde_json::to_string(&projects).map_err(anyhow::Error::from)?)
}

#[tauri::command]
pub fn get_project_by_id(
    token: String,
    id: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Get user_id from token
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Get project by id
    let project_info: Result<ProjectInfo, _> = conn.query_row(
        "SELECT p.id, p.area_id, a.name as area_name, p.title, p.description, p.status, p.priority, p.start_date, p.end_date, p.created_at, p.updated_at 
         FROM projects p 
         LEFT JOIN areas a ON p.area_id = a.id 
         WHERE p.id = ?1 AND p.user_id = ?2",
        params![id, user_id],
        |row| {
            Ok(ProjectInfo {
                id: row.get(0)?,
                area_id: row.get(1)?,
                area_name: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                status: row.get(5)?,
                priority: row.get(6)?,
                start_date: row.get(7)?,
                end_date: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        },
    );

    match project_info {
        Ok(project) => Ok(serde_json::to_string(&project).map_err(anyhow::Error::from)?),
        Err(_) => Err(tauri::Error::Anyhow(anyhow::anyhow!("Project not found"))),
    }
}

#[tauri::command]
pub fn update_project(
    token: String,
    id: String,
    json: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Get user_id from token
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Parse request
    let request: UpdateProjectRequest = serde_json::from_str(&json).map_err(|e| {
        println!("JSON parse error: {}", e);
        println!("JSON: {}", json);
        anyhow::Error::from(e)
    })?;

    // Validate
    if request.title.trim().is_empty() {
        let error_response = ProjectResponse {
            success: false,
            message: Some("Project title cannot be empty".to_string()),
            project: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    if !validate_status(&request.status) {
        let error_response = ProjectResponse {
            success: false,
            message: Some("Invalid status. Must be: Inbox, Planned, Progress, or Done".to_string()),
            project: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    if let Some(ref priority) = request.priority {
        if !validate_priority(priority) {
            let error_response = ProjectResponse {
                success: false,
                message: Some("Invalid priority. Must be: High, Medium, or Low".to_string()),
                project: None,
            };
            return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
        }
    }

    // Check if project exists and belongs to user
    let project_user_id: String = conn
        .query_row(
            "SELECT user_id FROM projects WHERE id = ?1",
            params![id],
            |row| row.get(0),
        )
        .map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("Project not found")))?;

    if project_user_id != user_id {
        let error_response = ProjectResponse {
            success: false,
            message: Some("You don't have permission to update this project".to_string()),
            project: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Verify area belongs to user
    let area_user_id: String = conn
        .query_row(
            "SELECT user_id FROM areas WHERE id = ?1",
            params![request.area_id],
            |row| row.get(0),
        )
        .map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("Area not found")))?;

    if area_user_id != user_id {
        let error_response = ProjectResponse {
            success: false,
            message: Some("You don't have permission to use this area".to_string()),
            project: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Update project
    let now = Utc::now().timestamp();
    conn.execute(
        "UPDATE projects SET area_id = ?1, title = ?2, description = ?3, status = ?4, priority = ?5, start_date = ?6, end_date = ?7, updated_at = ?8 WHERE id = ?9",
        params![
            request.area_id,
            request.title.trim(),
            request.description.map(|d| d.trim().to_string()).filter(|d| !d.is_empty()),
            request.status,
            request.priority,
            request.start_date,
            request.end_date,
            now,
            id
        ],
    )
    .map_err(anyhow::Error::from)?;

    // Get updated project
    let project_info: ProjectInfo = conn
        .query_row(
            "SELECT p.id, p.area_id, a.name as area_name, p.title, p.description, p.status, p.priority, p.start_date, p.end_date, p.created_at, p.updated_at 
             FROM projects p 
             LEFT JOIN areas a ON p.area_id = a.id 
             WHERE p.id = ?1",
            params![id],
            |row| {
                Ok(ProjectInfo {
                    id: row.get(0)?,
                    area_id: row.get(1)?,
                    area_name: row.get(2)?,
                    title: row.get(3)?,
                    description: row.get(4)?,
                    status: row.get(5)?,
                    priority: row.get(6)?,
                    start_date: row.get(7)?,
                    end_date: row.get(8)?,
                    created_at: row.get(9)?,
                    updated_at: row.get(10)?,
                })
            },
        )
        .map_err(anyhow::Error::from)?;

    let response = ProjectResponse {
        success: true,
        message: None,
        project: Some(project_info),
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}

#[tauri::command]
pub fn move_project(
    token: String,
    id: String,
    new_status: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Get user_id from token
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Validate status
    if !validate_status(&new_status) {
        let error_response = ProjectResponse {
            success: false,
            message: Some("Invalid status. Must be: Inbox, Planned, Progress, or Done".to_string()),
            project: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Check if project exists and belongs to user
    let project_user_id: String = conn
        .query_row(
            "SELECT user_id FROM projects WHERE id = ?1",
            params![id],
            |row| row.get(0),
        )
        .map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("Project not found")))?;

    if project_user_id != user_id {
        let error_response = ProjectResponse {
            success: false,
            message: Some("You don't have permission to move this project".to_string()),
            project: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Update status
    let now = Utc::now().timestamp();
    conn.execute(
        "UPDATE projects SET status = ?1, updated_at = ?2 WHERE id = ?3",
        params![new_status, now, id],
    )
    .map_err(anyhow::Error::from)?;

    // Get updated project
    let project_info: ProjectInfo = conn
        .query_row(
            "SELECT p.id, p.area_id, a.name as area_name, p.title, p.description, p.status, p.priority, p.start_date, p.end_date, p.created_at, p.updated_at 
             FROM projects p 
             LEFT JOIN areas a ON p.area_id = a.id 
             WHERE p.id = ?1",
            params![id],
            |row| {
                Ok(ProjectInfo {
                    id: row.get(0)?,
                    area_id: row.get(1)?,
                    area_name: row.get(2)?,
                    title: row.get(3)?,
                    description: row.get(4)?,
                    status: row.get(5)?,
                    priority: row.get(6)?,
                    start_date: row.get(7)?,
                    end_date: row.get(8)?,
                    created_at: row.get(9)?,
                    updated_at: row.get(10)?,
                })
            },
        )
        .map_err(anyhow::Error::from)?;

    let response = ProjectResponse {
        success: true,
        message: None,
        project: Some(project_info),
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}

#[tauri::command]
pub fn delete_project(
    token: String,
    id: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Get user_id from token
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Check if project exists and belongs to user
    let project_user_id: String = conn
        .query_row(
            "SELECT user_id FROM projects WHERE id = ?1",
            params![id],
            |row| row.get(0),
        )
        .map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("Project not found")))?;

    if project_user_id != user_id {
        let error_response = ProjectResponse {
            success: false,
            message: Some("You don't have permission to delete this project".to_string()),
            project: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Delete project
    conn.execute("DELETE FROM projects WHERE id = ?1", params![id])
        .map_err(anyhow::Error::from)
        .map_err(tauri::Error::from)?;

    let response = ProjectResponse {
        success: true,
        message: Some("Project deleted successfully".to_string()),
        project: None,
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}
