const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "app.db");

console.log("Database Path:", dbPath);

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("foreign_keys = ON");
db.pragma("temp_store = MEMORY");
db.pragma("cache_size = -10000");
db.pragma("busy_timeout = 10000");

console.log("✅ SQLite Connected");
console.log("✅ SQLite Optimizations Enabled");

const DEBUG_SQL = false;

function run(sql, params = []) {
    if (DEBUG_SQL) {
        console.log(sql);
    }
    return db.prepare(sql).run(params);
}

function get(sql, params = []) {
    return db.prepare(sql).get(params);
}

function all(sql, params = []) {
    return db.prepare(sql).all(params);
}

function createIndex(name, sql) {
    db.prepare(sql).run();
    console.log(`✅ ${name}`);
}

function addColumnIfNotExists(table, column, definition) {
    const rows = db.prepare(`PRAGMA table_info(${table})`).all();

    const exists = rows.some(r => r.name === column);

    if (!exists) {
        db.prepare(
            `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`
        ).run();

        console.log(`✓ ${table}.${column} added`);
    }
}

console.log("Database module loaded");

run(`
CREATE TABLE IF NOT EXISTS original_videos(
id TEXT PRIMARY KEY,
file_name TEXT,
file_path TEXT,
status TEXT DEFAULT 'pending',
used INTEGER DEFAULT 0,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

run(`
CREATE TABLE IF NOT EXISTS result_clips(
id TEXT PRIMARY KEY,
file_name TEXT,
file_path TEXT,
status TEXT DEFAULT 'available',
used INTEGER DEFAULT 0,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

run(`
CREATE TABLE IF NOT EXISTS music_packages(
id TEXT PRIMARY KEY,
music_file TEXT,
description TEXT,
hashtags TEXT,
license TEXT,
active INTEGER DEFAULT 1,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

run(`
CREATE TABLE IF NOT EXISTS generated_videos(
id TEXT PRIMARY KEY,
original_video_id TEXT,
result_clip_id TEXT,
music_package_id TEXT,
title TEXT,
description TEXT,
output_file TEXT,
status TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

run(`
CREATE TABLE IF NOT EXISTS upload_history(
id TEXT PRIMARY KEY,
video_id TEXT,
platform TEXT,
status TEXT,
uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

addColumnIfNotExists("music_packages","package_name","TEXT");
addColumnIfNotExists("music_packages","used_count","INTEGER DEFAULT 0");
addColumnIfNotExists("music_packages","last_used","DATETIME");
addColumnIfNotExists("music_packages","platforms","TEXT");
addColumnIfNotExists("music_packages","metadata_file","TEXT");

addColumnIfNotExists("generated_videos","package_name","TEXT");
addColumnIfNotExists("generated_videos","tags","TEXT");
addColumnIfNotExists("generated_videos","category_id","TEXT");
addColumnIfNotExists("generated_videos","privacy_status","TEXT");
addColumnIfNotExists("generated_videos","made_for_kids","INTEGER DEFAULT 0");
addColumnIfNotExists("generated_videos","youtube_video_id","TEXT");
addColumnIfNotExists("generated_videos","youtube_url","TEXT");
addColumnIfNotExists("generated_videos","upload_time","DATETIME");
addColumnIfNotExists("generated_videos","upload_error","TEXT");

createIndex(
    "idx_original_status_used",
    `CREATE INDEX IF NOT EXISTS idx_original_status_used
    ON original_videos(status, used)`
);

createIndex(
    "idx_original_created",
    `CREATE INDEX IF NOT EXISTS idx_original_created
    ON original_videos(created_at)`
);

createIndex(
    "idx_result_status_used",
    `CREATE INDEX IF NOT EXISTS idx_result_status_used
    ON result_clips(status, used)`
);

createIndex(
    "idx_generated_status",
    `CREATE INDEX IF NOT EXISTS idx_generated_status
    ON generated_videos(status)`
);

createIndex(
    "idx_generated_created",
    `CREATE INDEX IF NOT EXISTS idx_generated_created
    ON generated_videos(created_at)`
);

createIndex(
    "idx_upload_history_video",
    `CREATE INDEX IF NOT EXISTS idx_upload_history_video
    ON upload_history(video_id)`
);

createIndex(
    "idx_generated_original",
    `CREATE INDEX IF NOT EXISTS idx_generated_original
    ON generated_videos(original_video_id)`
);

createIndex(
    "idx_generated_status_created",
    `CREATE INDEX IF NOT EXISTS idx_generated_status_created
    ON generated_videos(status, created_at)`
);

console.log("✅ Database Indexes Ready");
console.log("✅ Database Initialized");

module.exports = {
    db,
    run,
    get,
    all
};