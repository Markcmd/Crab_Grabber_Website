PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS waitlist (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  party_size INTEGER NOT NULL CHECK (party_size >= 1),
  status TEXT NOT NULL DEFAULT 'waiting',  -- waiting | notified | seated | done | no_show
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_waitlist_status_created
ON waitlist(status, created_at);