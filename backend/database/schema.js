const database = require("./connection");

function initializeSchema() {
  database.exec(`
    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS draws (
      id INTEGER PRIMARY KEY,
      draw_number INTEGER NOT NULL UNIQUE,
      draw_type TEXT NOT NULL CHECK (draw_type IN ('initial', 'additional', 'reroll')),
      max_people_per_group INTEGER NOT NULL CHECK (max_people_per_group >= 1),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS draw_groups (
      id INTEGER PRIMARY KEY,
      draw_id INTEGER NOT NULL REFERENCES draws(id),
      group_name TEXT NOT NULL,
      group_order INTEGER NOT NULL,
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS draw_group_members (
      id INTEGER PRIMARY KEY,
      group_id INTEGER NOT NULL REFERENCES draw_groups(id),
      person_id INTEGER NOT NULL REFERENCES people(id),
      member_order INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS draw_group_events (
      id INTEGER PRIMARY KEY,
      group_id INTEGER NOT NULL REFERENCES draw_groups(id),
      event_type TEXT NOT NULL CHECK (event_type IN ('renamed', 'deleted', 'restored', 'rerolled')),
      old_name TEXT,
      new_name TEXT,
      metadata_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_people_status ON people(status);
    CREATE INDEX IF NOT EXISTS idx_draws_created_at ON draws(created_at);
    CREATE INDEX IF NOT EXISTS idx_group_members_group ON draw_group_members(group_id);
  `);
}

module.exports = { initializeSchema };
