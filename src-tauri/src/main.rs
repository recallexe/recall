// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::Result;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::Connection;

fn create_tables(conn: &Connection) -> Result<()> {
    let users_schema = include_str!("../sql/users.sql");
    let sessions_schema = include_str!("../sql/sessions.sql");
    let schema = format!("{}\n{}", users_schema, sessions_schema);

    conn.execute_batch(&schema)?;
    Ok(())
}

fn main() -> Result<()> {
    let current_dir = std::env::current_dir().unwrap();
    let db_path = current_dir.join("recall.db");

    if !db_path.exists() {
        std::fs::create_dir_all(current_dir.join("recall"))?;
        std::fs::File::create(&db_path)?;
    }

    // Use sqlite3 database
    let manager = SqliteConnectionManager::file(db_path).with_init(move |conn| {
        let _ = create_tables(conn).map_err(|e| anyhow::anyhow!("Failed to create tables: {}", e));
        Ok(())
    });
    let pool = Pool::new(manager).expect("Failed to create pool.");
    recall_lib::run(pool);
    Ok(())
}
