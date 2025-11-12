use anyhow::Result;
use bcrypt::{DEFAULT_COST, hash, verify};
use chrono::Utc;
use exemplar::Model;
use rand::Rng;
use rusqlite::params;
use serde::{Deserialize, Serialize};

use crate::{AppState, HasId, generate_id, try_insert_thing};

#[derive(Debug, PartialEq, Serialize, Deserialize, Model)]
#[table("users")]
#[check("../sql/users.sql")]
pub struct User {
    pub id: Option<String>,
    pub email: String,
    pub name: String,
    pub password_hash: String,
    pub created_at: i64,
    pub updated_at: i64,
}

impl HasId for User {
    fn id_mut(&mut self) -> &mut Option<String> {
        &mut self.id
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Model)]
#[table("sessions")]
#[check("../sql/sessions.sql")]
pub struct Session {
    pub id: Option<String>,
    pub user_id: String,
    pub token: String,
    pub expires_at: i64,
    pub created_at: i64,
}

impl HasId for Session {
    fn id_mut(&mut self) -> &mut Option<String> {
        &mut self.id
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SignupRequest {
    pub email: String,
    pub name: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SigninRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChangePasswordResponse {
    pub success: bool,
    pub message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateUserRequest {
    pub name: String,
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateUserResponse {
    pub success: bool,
    pub message: Option<String>,
    pub user: Option<UserInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub success: bool,
    pub token: Option<String>,
    pub message: Option<String>,
    pub user: Option<UserInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserInfo {
    pub id: String,
    pub email: String,
    pub name: String,
}

fn generate_token() -> String {
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let mut rng = rand::rng();
    (0..64)
        .map(|_| {
            let idx = rng.random_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}

#[tauri::command]
pub fn signup(json: String, state: tauri::State<'_, AppState>) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Parse request
    let request: SignupRequest = serde_json::from_str(&json).map_err(|e| {
        println!("JSON parse error: {}", e);
        println!("JSON: {}", json);
        anyhow::Error::from(e)
    })?;

    // Check if user already exists
    let existing: Result<String, _> = conn.query_row(
        "SELECT id FROM users WHERE email = ?1",
        params![request.email],
        |row| row.get(0),
    );

    if existing.is_ok() {
        let error_response = AuthResponse {
            success: false,
            token: None,
            message: Some("User with this email already exists".to_string()),
            user: None,
        };
        return Err(tauri::Error::from(anyhow::anyhow!(
            "{}",
            serde_json::to_string(&error_response).unwrap_or_default()
        )));
    }

    // Hash password
    let password_hash = hash(&request.password, DEFAULT_COST).map_err(anyhow::Error::from)?;

    // Create user using exemplar
    let now = Utc::now().timestamp();
    let mut user = User {
        id: None,
        email: request.email.clone(),
        name: request.name.clone(),
        password_hash,
        created_at: now,
        updated_at: now,
    };

    let user_id = try_insert_thing(&mut user, &conn)?;
    println!("inserted User id: {:?}", user_id);

    // Create session using exemplar
    let token = generate_token();
    let expires_at = now + (30 * 24 * 60 * 60); // 30 days
    let mut session = Session {
        id: None,
        user_id: user_id.clone(),
        token: token.clone(),
        expires_at,
        created_at: now,
    };

    let session_id = try_insert_thing(&mut session, &conn)?;
    println!("inserted Session id: {:?}", session_id);

    let response = AuthResponse {
        success: true,
        token: Some(token),
        message: None,
        user: Some(UserInfo {
            id: user_id,
            email: request.email,
            name: request.name,
        }),
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}

#[tauri::command]
pub fn signin(json: String, state: tauri::State<'_, AppState>) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Parse request
    let request: SigninRequest = serde_json::from_str(&json).map_err(|e| {
        println!("JSON parse error: {}", e);
        println!("JSON: {}", json);
        anyhow::Error::from(e)
    })?;

    // Get user by email
    let user: Result<(String, String, String, String), _> = conn.query_row(
        "SELECT id, email, name, password_hash FROM users WHERE email = ?1",
        params![request.email],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
    );

    let (user_id, email, name, password_hash) = match user {
        Ok(u) => u,
        Err(_) => {
            let error_response = AuthResponse {
                success: false,
                token: None,
                message: Some("Invalid email or password".to_string()),
                user: None,
            };
            return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
        }
    };

    // Verify password
    if !verify(&request.password, &password_hash).unwrap_or(false) {
        let error_response = AuthResponse {
            success: false,
            token: None,
            message: Some("Invalid email or password".to_string()),
            user: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Create session using exemplar
    let token = generate_token();
    let now = Utc::now().timestamp();
    let expires_at = now + (30 * 24 * 60 * 60); // 30 days
    let mut session = Session {
        id: None,
        user_id: user_id.clone(),
        token: token.clone(),
        expires_at,
        created_at: now,
    };

    let session_id = try_insert_thing(&mut session, &conn)?;
    println!("inserted Session id: {:?}", session_id);

    let response = AuthResponse {
        success: true,
        token: Some(token),
        message: None,
        user: Some(UserInfo {
            id: user_id,
            email,
            name,
        }),
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}

#[tauri::command]
pub fn validate_token(
    token: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    let now = Utc::now().timestamp();

    // Get session and user
    let result: Result<(String, String, String), _> = conn.query_row(
        "SELECT s.user_id, u.email, u.name FROM sessions s 
         INNER JOIN users u ON s.user_id = u.id 
         WHERE s.token = ?1 AND s.expires_at > ?2",
        params![token, now],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
    );

    let user_info = match result {
        Ok((user_id, email, name)) => Some(UserInfo {
            id: user_id,
            email,
            name,
        }),
        Err(_) => None,
    };

    Ok(serde_json::to_string(&user_info).map_err(anyhow::Error::from)?)
}

#[tauri::command]
pub fn update_user(
    token: String,
    json: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Parse request
    let request: UpdateUserRequest = serde_json::from_str(&json).map_err(|e| {
        println!("JSON parse error: {}", e);
        println!("JSON: {}", json);
        anyhow::Error::from(e)
    })?;

    let now = Utc::now().timestamp();

    // Get user_id from token
    let user_id_result: Result<String, _> = conn.query_row(
        "SELECT user_id FROM sessions WHERE token = ?1 AND expires_at > ?2",
        params![token, now],
        |row| row.get(0),
    );

    let user_id = match user_id_result {
        Ok(id) => id,
        Err(_) => {
            let error_response = UpdateUserResponse {
                success: false,
                message: Some("Invalid or expired token".to_string()),
                user: None,
            };
            return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
        }
    };

    // Validate email format (basic check)
    if !request.email.contains('@') || !request.email.contains('.') {
        let error_response = UpdateUserResponse {
            success: false,
            message: Some("Invalid email format".to_string()),
            user: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Check if email is already taken by another user
    let email_check: Result<String, _> = conn.query_row(
        "SELECT id FROM users WHERE email = ?1 AND id != ?2",
        params![request.email, user_id],
        |row| row.get(0),
    );

    if email_check.is_ok() {
        let error_response = UpdateUserResponse {
            success: false,
            message: Some("Email is already taken by another user".to_string()),
            user: None,
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Update user
    conn.execute(
        "UPDATE users SET name = ?1, email = ?2, updated_at = ?3 WHERE id = ?4",
        params![request.name, request.email, now, user_id],
    )
    .map_err(anyhow::Error::from)?;

    let response = UpdateUserResponse {
        success: true,
        message: None,
        user: Some(UserInfo {
            id: user_id,
            email: request.email,
            name: request.name,
        }),
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}

#[tauri::command]
pub fn change_password_with_token(
    token: String,
    json: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    // Parse request
    let request: ChangePasswordRequest = serde_json::from_str(&json).map_err(|e| {
        println!("JSON parse error: {}", e);
        println!("JSON: {}", json);
        anyhow::Error::from(e)
    })?;

    let now = Utc::now().timestamp();

    // Get user_id from token
    let user_id_result: Result<String, _> = conn.query_row(
        "SELECT user_id FROM sessions WHERE token = ?1 AND expires_at > ?2",
        params![token, now],
        |row| row.get(0),
    );

    let user_id = match user_id_result {
        Ok(id) => id,
        Err(_) => {
            let error_response = ChangePasswordResponse {
                success: false,
                message: Some("Invalid or expired token".to_string()),
            };
            return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
        }
    };

    // Get current password hash
    let password_hash_result: Result<String, _> = conn.query_row(
        "SELECT password_hash FROM users WHERE id = ?1",
        params![user_id],
        |row| row.get(0),
    );

    let password_hash = match password_hash_result {
        Ok(hash) => hash,
        Err(_) => {
            let error_response = ChangePasswordResponse {
                success: false,
                message: Some("User not found".to_string()),
            };
            return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
        }
    };

    // Verify current password
    if !verify(&request.current_password, &password_hash).unwrap_or(false) {
        let error_response = ChangePasswordResponse {
            success: false,
            message: Some("Current password is incorrect".to_string()),
        };
        return Ok(serde_json::to_string(&error_response).map_err(anyhow::Error::from)?);
    }

    // Hash new password
    let new_password_hash = hash(&request.new_password, DEFAULT_COST)
        .map_err(|e| anyhow::anyhow!("Failed to hash password: {}", e))?;

    // Update password
    conn.execute(
        "UPDATE users SET password_hash = ?1, updated_at = ?2 WHERE id = ?3",
        params![new_password_hash, now, user_id],
    )
    .map_err(anyhow::Error::from)?;

    let response = ChangePasswordResponse {
        success: true,
        message: None,
    };

    Ok(serde_json::to_string(&response).map_err(anyhow::Error::from)?)
}

#[tauri::command]
pub fn delete_session(
    token: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, tauri::Error> {
    let conn = state.pool.get().map_err(anyhow::Error::from)?;

    conn.execute("DELETE FROM sessions WHERE token = ?1", params![token])
        .map(|_| token.clone())
        .map_err(anyhow::Error::from)?;

    Ok(token)
}
