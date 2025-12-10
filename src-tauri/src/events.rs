use anyhow::Result;
use chrono::Utc;
use exemplar::Model;
use rusqlite::params;
use serde::{Deserialize, Serialize};

use crate::{AppState, HasId, get_user_id_from_token, try_insert_thing};

#[derive(Debug, PartialEq, Serialize, Deserialize, Model)]
#[table("events")]
#[check("../sql/events.sql")]
pub struct Event {
    pub id: Option<String>,
    pub user_id: String,
    pub project_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub start_time: i64,
    pub end_time: Option<i64>,
    pub location: Option<String>,
    pub all_day: i64, // 0 = false, 1 = true
    pub created_at: i64,
    pub updated_at: i64,
}

impl HasId for Event {
    fn id_mut(&mut self) -> &mut Option<String> {
        &mut self.id
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateEventRequest {
    pub project_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub start_time: i64,
    pub end_time: Option<i64>,
    pub location: Option<String>,
    pub all_day: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateEventRequest {
    pub project_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub start_time: i64,
    pub end_time: Option<i64>,
    pub location: Option<String>,
    pub all_day: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EventResponse {
    pub success: bool,
    pub message: Option<String>,
    pub event: Option<EventInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EventInfo {
    pub id: String,
    pub project_id: Option<String>,
    pub project_name: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub start_time: i64,
    pub end_time: Option<i64>,
    pub location: Option<String>,
    pub all_day: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EventsListResponse {
    pub success: bool,
    pub message: Option<String>,
    pub events: Vec<EventInfo>,
}

#[tauri::command(rename_all = "snake_case")]
pub fn create_event(
    token: String,
    json: String,
    state: tauri::State<AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Parse request
    let request: CreateEventRequest = serde_json::from_str(&json).map_err(|e| {
        println!("JSON parse error: {}", e);
        println!("JSON: {}", json);
        anyhow::Error::from(e)
    })?;

    // Validate title
    if request.title.trim().is_empty() {
        let error_response = EventResponse {
            success: false,
            message: Some("Event title cannot be empty".to_string()),
            event: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Validate end_time is after start_time if provided
    if let Some(end_time) = request.end_time {
        if end_time <= request.start_time {
            let error_response = EventResponse {
                success: false,
                message: Some("End time must be after start time".to_string()),
                event: None,
            };
            return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
        }
    }

    // Validate that project belongs to user if provided
    if let Some(ref project_id) = request.project_id {
        let project_user_id: String = conn
            .query_row(
                "SELECT user_id FROM projects WHERE id = ?1",
                params![project_id],
                |row| row.get(0),
            )
            .map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("Project not found")))?;

        if project_user_id != user_id {
            let error_response = EventResponse {
                success: false,
                message: Some(
                    "You don't have permission to create events for this project".to_string(),
                ),
                event: None,
            };
            return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
        }
    }

    // Create event
    let now = Utc::now().timestamp();
    let mut event = Event {
        id: None,
        user_id: user_id.clone(),
        project_id: request.project_id,
        title: request.title.trim().to_string(),
        description: request
            .description
            .map(|d| d.trim().to_string())
            .filter(|d| !d.is_empty()),
        start_time: request.start_time,
        end_time: request.end_time,
        location: request
            .location
            .map(|l| l.trim().to_string())
            .filter(|l| !l.is_empty()),
        all_day: if request.all_day { 1 } else { 0 },
        created_at: now,
        updated_at: now,
    };

    let event_id = try_insert_thing(&mut event, &conn)?;
    println!("inserted Event id: {:?}", event_id);

    // Get project name for response if project_id exists
    let project_name: Option<String> = if let Some(ref pid) = event.project_id {
        conn.query_row(
            "SELECT title FROM projects WHERE id = ?1",
            params![pid],
            |row| row.get(0),
        )
        .ok()
    } else {
        None
    };

    let response = EventResponse {
        success: true,
        message: None,
        event: Some(EventInfo {
            id: event_id,
            project_id: event.project_id,
            project_name,
            title: event.title,
            description: event.description,
            start_time: event.start_time,
            end_time: event.end_time,
            location: event.location,
            all_day: event.all_day == 1,
            created_at: event.created_at,
            updated_at: event.updated_at,
        }),
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_events(
    token: String,
    start_date: Option<i64>,
    end_date: Option<i64>,
    project_id: Option<String>,
    state: tauri::State<AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Build query dynamically based on filters
    let events_result: Result<Vec<EventInfo>, anyhow::Error> = match (
        start_date, end_date, project_id,
    ) {
        (None, None, None) => {
            let query = "SELECT e.id, e.project_id, e.title, e.description, e.start_time, e.end_time, e.location, e.all_day, e.created_at, e.updated_at, p.title as project_name FROM events e LEFT JOIN projects p ON e.project_id = p.id WHERE e.user_id = ?1 ORDER BY e.start_time ASC".to_string();
            let mut stmt = conn.prepare(&query).map_err(anyhow::Error::from)?;
            let event_iter = stmt
                .query_map(
                    params![user_id],
                    |row| -> Result<EventInfo, rusqlite::Error> {
                        Ok(EventInfo {
                            id: row.get(0)?,
                            project_id: row.get(1)?,
                            project_name: row.get(10)?,
                            title: row.get(2)?,
                            description: row.get(3)?,
                            start_time: row.get(4)?,
                            end_time: row.get(5)?,
                            location: row.get(6)?,
                            all_day: row.get::<_, i64>(7)? == 1,
                            created_at: row.get(8)?,
                            updated_at: row.get(9)?,
                        })
                    },
                )
                .map_err(anyhow::Error::from)?;
            let mut events = Vec::new();
            for event_result in event_iter {
                events.push(event_result.map_err(anyhow::Error::from)?);
            }
            Ok(events)
        }
        (Some(start), None, None) => {
            let query = "SELECT e.id, e.project_id, e.title, e.description, e.start_time, e.end_time, e.location, e.all_day, e.created_at, e.updated_at, p.title as project_name FROM events e LEFT JOIN projects p ON e.project_id = p.id WHERE e.user_id = ?1 AND e.start_time >= ?2 ORDER BY e.start_time ASC".to_string();
            let mut stmt = conn.prepare(&query).map_err(anyhow::Error::from)?;
            let event_iter = stmt
                .query_map(params![user_id, start], |row| {
                    Ok(EventInfo {
                        id: row.get(0)?,
                        project_id: row.get(1)?,
                        project_name: row.get(10)?,
                        title: row.get(2)?,
                        description: row.get(3)?,
                        start_time: row.get(4)?,
                        end_time: row.get(5)?,
                        location: row.get(6)?,
                        all_day: row.get::<_, i64>(7)? == 1,
                        created_at: row.get(8)?,
                        updated_at: row.get(9)?,
                    })
                })
                .map_err(anyhow::Error::from)?;
            let mut events = Vec::new();
            for event_result in event_iter {
                events.push(event_result.map_err(anyhow::Error::from)?);
            }
            Ok(events)
        }
        (Some(start), Some(end), None) => {
            let query = "SELECT e.id, e.project_id, e.title, e.description, e.start_time, e.end_time, e.location, e.all_day, e.created_at, e.updated_at, p.title as project_name FROM events e LEFT JOIN projects p ON e.project_id = p.id WHERE e.user_id = ?1 AND e.start_time >= ?2 AND e.start_time <= ?3 ORDER BY e.start_time ASC".to_string();
            let mut stmt = conn.prepare(&query).map_err(anyhow::Error::from)?;
            let event_iter = stmt
                .query_map(params![user_id, start, end], |row| {
                    Ok(EventInfo {
                        id: row.get(0)?,
                        project_id: row.get(1)?,
                        project_name: row.get(10)?,
                        title: row.get(2)?,
                        description: row.get(3)?,
                        start_time: row.get(4)?,
                        end_time: row.get(5)?,
                        location: row.get(6)?,
                        all_day: row.get::<_, i64>(7)? == 1,
                        created_at: row.get(8)?,
                        updated_at: row.get(9)?,
                    })
                })
                .map_err(anyhow::Error::from)?;
            let mut events = Vec::new();
            for event_result in event_iter {
                events.push(event_result.map_err(anyhow::Error::from)?);
            }
            Ok(events)
        }
        (Some(start), Some(end), Some(ref pid)) => {
            let query = "SELECT e.id, e.project_id, e.title, e.description, e.start_time, e.end_time, e.location, e.all_day, e.created_at, e.updated_at, p.title as project_name FROM events e LEFT JOIN projects p ON e.project_id = p.id WHERE e.user_id = ?1 AND e.start_time >= ?2 AND e.start_time <= ?3 AND e.project_id = ?4 ORDER BY e.start_time ASC".to_string();
            let mut stmt = conn.prepare(&query).map_err(anyhow::Error::from)?;
            let event_iter = stmt
                .query_map(params![user_id, start, end, pid], |row| {
                    Ok(EventInfo {
                        id: row.get(0)?,
                        project_id: row.get(1)?,
                        project_name: row.get(10)?,
                        title: row.get(2)?,
                        description: row.get(3)?,
                        start_time: row.get(4)?,
                        end_time: row.get(5)?,
                        location: row.get(6)?,
                        all_day: row.get::<_, i64>(7)? == 1,
                        created_at: row.get(8)?,
                        updated_at: row.get(9)?,
                    })
                })
                .map_err(anyhow::Error::from)?;
            let mut events = Vec::new();
            for event_result in event_iter {
                events.push(event_result.map_err(anyhow::Error::from)?);
            }
            Ok(events)
        }
        (Some(start), None, Some(ref pid)) => {
            let query = "SELECT e.id, e.project_id, e.title, e.description, e.start_time, e.end_time, e.location, e.all_day, e.created_at, e.updated_at, p.title as project_name FROM events e LEFT JOIN projects p ON e.project_id = p.id WHERE e.user_id = ?1 AND e.start_time >= ?2 AND e.project_id = ?3 ORDER BY e.start_time ASC".to_string();
            let mut stmt = conn.prepare(&query).map_err(anyhow::Error::from)?;
            let event_iter = stmt
                .query_map(params![user_id, start, pid], |row| {
                    Ok(EventInfo {
                        id: row.get(0)?,
                        project_id: row.get(1)?,
                        project_name: row.get(10)?,
                        title: row.get(2)?,
                        description: row.get(3)?,
                        start_time: row.get(4)?,
                        end_time: row.get(5)?,
                        location: row.get(6)?,
                        all_day: row.get::<_, i64>(7)? == 1,
                        created_at: row.get(8)?,
                        updated_at: row.get(9)?,
                    })
                })
                .map_err(anyhow::Error::from)?;
            let mut events = Vec::new();
            for event_result in event_iter {
                events.push(event_result.map_err(anyhow::Error::from)?);
            }
            Ok(events)
        }
        (None, Some(end), None) => {
            let query = "SELECT e.id, e.project_id, e.title, e.description, e.start_time, e.end_time, e.location, e.all_day, e.created_at, e.updated_at, p.title as project_name FROM events e LEFT JOIN projects p ON e.project_id = p.id WHERE e.user_id = ?1 AND e.start_time <= ?2 ORDER BY e.start_time ASC".to_string();
            let mut stmt = conn.prepare(&query).map_err(anyhow::Error::from)?;
            let event_iter = stmt
                .query_map(params![user_id, end], |row| {
                    Ok(EventInfo {
                        id: row.get(0)?,
                        project_id: row.get(1)?,
                        project_name: row.get(10)?,
                        title: row.get(2)?,
                        description: row.get(3)?,
                        start_time: row.get(4)?,
                        end_time: row.get(5)?,
                        location: row.get(6)?,
                        all_day: row.get::<_, i64>(7)? == 1,
                        created_at: row.get(8)?,
                        updated_at: row.get(9)?,
                    })
                })
                .map_err(anyhow::Error::from)?;
            let mut events = Vec::new();
            for event_result in event_iter {
                events.push(event_result.map_err(anyhow::Error::from)?);
            }
            Ok(events)
        }
        (None, Some(end), Some(ref pid)) => {
            let query = "SELECT e.id, e.project_id, e.title, e.description, e.start_time, e.end_time, e.location, e.all_day, e.created_at, e.updated_at, p.title as project_name FROM events e LEFT JOIN projects p ON e.project_id = p.id WHERE e.user_id = ?1 AND e.start_time <= ?2 AND e.project_id = ?3 ORDER BY e.start_time ASC".to_string();
            let mut stmt = conn.prepare(&query).map_err(anyhow::Error::from)?;
            let event_iter = stmt
                .query_map(params![user_id, end, pid], |row| {
                    Ok(EventInfo {
                        id: row.get(0)?,
                        project_id: row.get(1)?,
                        project_name: row.get(10)?,
                        title: row.get(2)?,
                        description: row.get(3)?,
                        start_time: row.get(4)?,
                        end_time: row.get(5)?,
                        location: row.get(6)?,
                        all_day: row.get::<_, i64>(7)? == 1,
                        created_at: row.get(8)?,
                        updated_at: row.get(9)?,
                    })
                })
                .map_err(anyhow::Error::from)?;
            let mut events = Vec::new();
            for event_result in event_iter {
                events.push(event_result.map_err(anyhow::Error::from)?);
            }
            Ok(events)
        }
        (None, None, Some(ref pid)) => {
            let query = "SELECT e.id, e.project_id, e.title, e.description, e.start_time, e.end_time, e.location, e.all_day, e.created_at, e.updated_at, p.title as project_name FROM events e LEFT JOIN projects p ON e.project_id = p.id WHERE e.user_id = ?1 AND e.project_id = ?2 ORDER BY e.start_time ASC".to_string();
            let mut stmt = conn.prepare(&query).map_err(anyhow::Error::from)?;
            let event_iter = stmt
                .query_map(params![user_id, pid], |row| {
                    Ok(EventInfo {
                        id: row.get(0)?,
                        project_id: row.get(1)?,
                        project_name: row.get(10)?,
                        title: row.get(2)?,
                        description: row.get(3)?,
                        start_time: row.get(4)?,
                        end_time: row.get(5)?,
                        location: row.get(6)?,
                        all_day: row.get::<_, i64>(7)? == 1,
                        created_at: row.get(8)?,
                        updated_at: row.get(9)?,
                    })
                })
                .map_err(anyhow::Error::from)?;
            let mut events = Vec::new();
            for event_result in event_iter {
                events.push(event_result.map_err(anyhow::Error::from)?);
            }
            Ok(events)
        }
    };

    let events = events_result.map_err(anyhow::Error::from)?;

    let response = EventsListResponse {
        success: true,
        message: None,
        events,
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_event_by_id(
    token: String,
    id: String,
    state: tauri::State<AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;
    let user_id = get_user_id_from_token(&token, &conn)?;

    let event_result: Result<EventInfo, rusqlite::Error> = conn.query_row(
        "SELECT e.id, e.project_id, e.title, e.description, e.start_time, e.end_time, e.location, e.all_day, e.created_at, e.updated_at, p.title as project_name FROM events e LEFT JOIN projects p ON e.project_id = p.id WHERE e.id = ?1 AND e.user_id = ?2",
        params![id, user_id],
        |row| {
            Ok(EventInfo {
                id: row.get(0)?,
                project_id: row.get(1)?,
                project_name: row.get(10)?,
                title: row.get(2)?,
                description: row.get(3)?,
                start_time: row.get(4)?,
                end_time: row.get(5)?,
                location: row.get(6)?,
                all_day: row.get::<_, i64>(7)? == 1,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        },
    );

    match event_result {
        Ok(event) => {
            let response = EventResponse {
                success: true,
                message: None,
                event: Some(event),
            };
            Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            let response = EventResponse {
                success: false,
                message: Some("Event not found".to_string()),
                event: None,
            };
            Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
        }
        Err(e) => Err(tauri::Error::Anyhow(anyhow::Error::from(e))),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn update_event(
    token: String,
    id: String,
    json: String,
    state: tauri::State<AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Parse request
    let request: UpdateEventRequest = serde_json::from_str(&json).map_err(|e| {
        println!("JSON parse error: {}", e);
        println!("JSON: {}", json);
        anyhow::Error::from(e)
    })?;

    // Validate title
    if request.title.trim().is_empty() {
        let error_response = EventResponse {
            success: false,
            message: Some("Event title cannot be empty".to_string()),
            event: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Validate end_time is after start_time if provided
    if let Some(end_time) = request.end_time {
        if end_time <= request.start_time {
            let error_response = EventResponse {
                success: false,
                message: Some("End time must be after start time".to_string()),
                event: None,
            };
            return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
        }
    }

    // Check if event exists and belongs to user
    let event_user_id: String = conn
        .query_row(
            "SELECT user_id FROM events WHERE id = ?1",
            params![id],
            |row| row.get(0),
        )
        .map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("Event not found")))?;

    if event_user_id != user_id {
        let error_response = EventResponse {
            success: false,
            message: Some("You don't have permission to update this event".to_string()),
            event: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Validate that project belongs to user if provided
    if let Some(ref project_id) = request.project_id {
        let project_user_id: String = conn
            .query_row(
                "SELECT user_id FROM projects WHERE id = ?1",
                params![project_id],
                |row| row.get(0),
            )
            .map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("Project not found")))?;

        if project_user_id != user_id {
            let error_response = EventResponse {
                success: false,
                message: Some(
                    "You don't have permission to assign events to this project".to_string(),
                ),
                event: None,
            };
            return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
        }
    }

    // Update event
    let now = Utc::now().timestamp();
    conn.execute(
        "UPDATE events SET project_id = ?1, title = ?2, description = ?3, start_time = ?4, end_time = ?5, location = ?6, all_day = ?7, updated_at = ?8 WHERE id = ?9 AND user_id = ?10",
        params![
            request.project_id,
            request.title.trim(),
            request.description.map(|d| d.trim().to_string()).filter(|d| !d.is_empty()),
            request.start_time,
            request.end_time,
            request.location.map(|l| l.trim().to_string()).filter(|l| !l.is_empty()),
            if request.all_day { 1 } else { 0 },
            now,
            id,
            user_id
        ],
    )
    .map_err(anyhow::Error::from)?;

    // Get updated event
    let event_result: Result<EventInfo, rusqlite::Error> = conn.query_row(
        "SELECT e.id, e.project_id, e.title, e.description, e.start_time, e.end_time, e.location, e.all_day, e.created_at, e.updated_at, p.title as project_name FROM events e LEFT JOIN projects p ON e.project_id = p.id WHERE e.id = ?1",
        params![id],
        |row| {
            Ok(EventInfo {
                id: row.get(0)?,
                project_id: row.get(1)?,
                project_name: row.get(10)?,
                title: row.get(2)?,
                description: row.get(3)?,
                start_time: row.get(4)?,
                end_time: row.get(5)?,
                location: row.get(6)?,
                all_day: row.get::<_, i64>(7)? == 1,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        },
    );

    match event_result {
        Ok(event) => {
            let response = EventResponse {
                success: true,
                message: None,
                event: Some(event),
            };
            Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
        }
        Err(e) => Err(tauri::Error::Anyhow(anyhow::Error::from(e))),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn delete_event(
    token: String,
    id: String,
    state: tauri::State<AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;
    let user_id = get_user_id_from_token(&token, &conn)?;

    // Check if event exists and belongs to user
    let event_user_id: String = conn
        .query_row(
            "SELECT user_id FROM events WHERE id = ?1",
            params![id],
            |row| row.get(0),
        )
        .map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("Event not found")))?;

    if event_user_id != user_id {
        let error_response = EventResponse {
            success: false,
            message: Some("You don't have permission to delete this event".to_string()),
            event: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Delete event
    conn.execute(
        "DELETE FROM events WHERE id = ?1 AND user_id = ?2",
        params![id, user_id],
    )
    .map_err(anyhow::Error::from)?;

    let response = EventResponse {
        success: true,
        message: Some("Event deleted successfully".to_string()),
        event: None,
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}
