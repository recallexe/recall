CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    content TEXT, -- For text documents
    file_data TEXT, -- Base64 encoded file data
    file_type TEXT, -- MIME type or file extension
    file_size INTEGER, -- Size in bytes
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_project_id ON resources(project_id);

