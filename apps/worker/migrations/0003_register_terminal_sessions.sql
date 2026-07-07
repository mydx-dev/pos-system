PRAGMA foreign_keys = ON;

CREATE TABLE register_terminal_sessions (
    token_hash TEXT PRIMARY KEY,
    register_terminal_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    last_used_at TEXT,
    FOREIGN KEY (register_terminal_id) REFERENCES register_terminals (id) ON DELETE CASCADE
);

CREATE INDEX idx_register_terminal_sessions_terminal_id
    ON register_terminal_sessions (register_terminal_id);

CREATE INDEX idx_register_terminal_sessions_expires_at
    ON register_terminal_sessions (expires_at);
