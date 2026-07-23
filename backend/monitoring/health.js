const db = require("../database/database");

function query(sql) {

    return new Promise((resolve, reject) => {

        db.get(sql, [], (err, row) => {

            if (err)
                return reject(err);

            resolve(row.count);

        });

    });

}

async function getHealth() {

    const pendingOriginals = await query(
        "SELECT COUNT(*) AS count FROM original_videos WHERE status='pending'"
    );

    const processingOriginals = await query(
        "SELECT COUNT(*) AS count FROM original_videos WHERE status='processing'"
    );

    const completedVideos = await query(
        "SELECT COUNT(*) AS count FROM generated_videos WHERE status='completed'"
    );

    const uploadingVideos = await query(
        "SELECT COUNT(*) AS count FROM generated_videos WHERE status='uploading'"
    );

    const uploadedVideos = await query(
        "SELECT COUNT(*) AS count FROM generated_videos WHERE status='uploaded'"
    );

    const failedUploads = await query(
        "SELECT COUNT(*) AS count FROM generated_videos WHERE status='upload_failed'"
    );

    return {

        pendingOriginals,
        processingOriginals,
        completedVideos,
        uploadingVideos,
        uploadedVideos,
        failedUploads,
        timestamp: new Date().toISOString()

    };

}

module.exports = {

    getHealth

};