const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "app.db");

console.log("Database Path:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ Database Error:", err.message);
    } else {
        console.log("✅ SQLite Connected");

        
        db.serialize(() => {

        db.run("PRAGMA journal_mode = WAL;");
        db.run("PRAGMA synchronous = NORMAL;");
        db.run("PRAGMA foreign_keys = ON;");
        db.run("PRAGMA temp_store = MEMORY;");
        db.run("PRAGMA cache_size = -10000;");
        db.run("PRAGMA busy_timeout = 10000;");

        console.log("✅ SQLite Optimizations Enabled");

    });
    }

});

const originalRun = db.run.bind(db);

const DEBUG_SQL = false;

db.run = function (sql, ...args) {

   if (
        DEBUG_SQL &&
        (
            sql.includes("original_videos") ||
            sql.includes("result_clips")
        )
    ) {

        console.log("\n================ SQL RUN ================");
        console.log(sql);
        console.trace();
        console.log("=========================================\n");

    }

    return originalRun(sql, ...args);
};


db.serialize(()=>{
    console.log("Database module loaded");


// Original Videos

db.run(`
CREATE TABLE IF NOT EXISTS original_videos(

id TEXT PRIMARY KEY,
file_name TEXT,
file_path TEXT,
status TEXT DEFAULT 'pending',
used INTEGER DEFAULT 0,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);



// Result Clips

db.run(`
CREATE TABLE IF NOT EXISTS result_clips(

id TEXT PRIMARY KEY,
file_name TEXT,
file_path TEXT,
status TEXT DEFAULT 'available',
used INTEGER DEFAULT 0,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);




// Music Packages

db.run(`
CREATE TABLE IF NOT EXISTS music_packages(

id TEXT PRIMARY KEY,
music_file TEXT,
description TEXT,
hashtags TEXT,
license TEXT,
active INTEGER DEFAULT 1,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);




// Generated Videos

db.run(`
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

)
`);




// Upload History

db.run(`
CREATE TABLE IF NOT EXISTS upload_history(

id TEXT PRIMARY KEY,
video_id TEXT,
platform TEXT,
status TEXT,
uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);


// music_packages migration

addColumnIfNotExists(
    "music_packages",
    "package_name",
    "TEXT"
);

addColumnIfNotExists(
    "music_packages",
    "used_count",
    "INTEGER DEFAULT 0"
);

addColumnIfNotExists(
    "music_packages",
    "last_used",
    "DATETIME"
);

addColumnIfNotExists(
    "music_packages",
    "platforms",
    "TEXT"
);

addColumnIfNotExists(
    "music_packages",
    "metadata_file",
    "TEXT"
);

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

});


module.exports = db;


function createIndex(name, sql) {

    db.run(sql, (err) => {

        if (err) {
            console.error(`❌ ${name}: ${err.message}`);
        } else {
            console.log(`✅ ${name}`);
        }

    });

}

function addColumnIfNotExists(table, column, definition) {

    db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {

        if (err) {
            console.error(err);
            return;
        }

        const exists = rows.some(r => r.name === column);

        if (!exists) {

            db.run(
                `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
                (err) => {

                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log(`✓ ${table}.${column} added`);
                    }

                }
            );

        }

    });

}