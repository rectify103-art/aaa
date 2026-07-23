const db = require("../database/database");

function getNextUpload() {

    return new Promise((resolve, reject) => {

        db.get(
            `
            SELECT
                id,
                title,
                description,
                tags,
                category_id,
                privacy_status,
                made_for_kids,
                output_file
            FROM generated_videos
            WHERE status = 'completed'
            ORDER BY created_at ASC
            LIMIT 1
            `,
            [],
            (err, row) => {

                if (err)
                    return reject(err);

                if (!row)
                    return resolve(null);

                resolve({

                    id: row.id,

                    file: row.output_file,

                    title: row.title,

                    description: row.description,

                    tags: row.tags
                        ? JSON.parse(row.tags)
                        : [],

                    categoryId:
                        row.category_id || "22",

                    privacyStatus:
                        row.privacy_status || "public",

                    madeForKids:
                        !!row.made_for_kids

                });

            }

        );

    });

}

function markUploading(id) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            UPDATE generated_videos
            SET status='uploading'
            WHERE id=?
            `,
            [id],
            err => {

                if (err)
                    reject(err);
                else
                    resolve();

            }
        );

    });

}




function markUploadFailed(id, error) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            UPDATE generated_videos
            SET
                status='upload_failed',
                upload_error=?
            WHERE id=?
            `,
            [
                error,
                id
            ],
            err => {

                if (err)
                    reject(err);
                else
                    resolve();

            }
        );

    });

}

function markUploaded(id, youtubeId, youtubeUrl) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            UPDATE generated_videos
            SET
                status='uploaded',
                youtube_video_id=?,
                youtube_url=?,
                uploaded_at=CURRENT_TIMESTAMP
            WHERE id=?
            `,
            [
                youtubeId,
                youtubeUrl,
                id
            ],
            err => {

                if (err)
                    reject(err);
                else
                    resolve();

            }
        );

    });

}

function getNextRetry() {

    return new Promise((resolve, reject) => {

        db.get(
            `
            SELECT *
            FROM generated_videos
            WHERE status = 'upload_failed'
            ORDER BY created_at ASC
            LIMIT 1
            `,
            [],
            (err, row) => {

                if (err)
                    return reject(err);

                resolve(row);

            }
        );

    });

}



async function claimNextUpload() {

    return new Promise((resolve, reject) => {

        db.serialize(() => {

            db.run("BEGIN IMMEDIATE TRANSACTION");

            db.get(
                `
                SELECT *
                FROM generated_videos
                WHERE status='completed'
                ORDER BY created_at ASC
                LIMIT 1
                `,
                [],
                (err, row) => {

                    if (err) {

                        db.run("ROLLBACK");
                        return reject(err);

                    }

                    if (!row) {

                        db.run("COMMIT");
                        return resolve(null);

                    }

                    db.run(
                        `
                        UPDATE generated_videos
                        SET status='uploading'
                        WHERE id=?
                        `,
                        [row.id],
                        function (err) {

                            if (err) {

                                db.run("ROLLBACK");
                                return reject(err);

                            }

                            db.run("COMMIT", err => {

                                if (err)
                                    return reject(err);

                                resolve({

                                    id: row.id,
                                    file: row.output_file,
                                    title: row.title,
                                    description: row.description,
                                    tags: row.tags
                                        ? JSON.parse(row.tags)
                                        : [],

                                    categoryId:
                                        row.category_id || "22",

                                    privacyStatus:
                                        row.privacy_status || "public",

                                    madeForKids:
                                        !!row.made_for_kids

                                });

                            });

                        }
                    );

                }

            );

        });

    });

}


module.exports = {
    getNextUpload,
    getNextRetry,
    markUploading,
    markUploaded,
    markUploadFailed,
    claimNextUpload
};