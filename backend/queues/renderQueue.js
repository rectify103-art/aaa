


















// Get next original video

function getNextOriginal() {
    return new Promise((resolve, reject) => {

        db.get(
            `
            SELECT *
            FROM original_videos
            WHERE used = 0
              AND status = 'pending'
            ORDER BY created_at ASC
            LIMIT 1
            `,
            [],
            (err, row) => {

                console.log("DB FILE =", db.filename || "unknown");
                console.log("SQL RESULT =", row);

                if (err) {
                    console.error(err);
                    return reject(err);
                }

                resolve(row);
            }
        );

    });
}



function markProcessing(id) {
    return new Promise((resolve, reject) => {
        db.run(
            `
            UPDATE original_videos
            SET
                used = 1,
                status = 'processing',
                processing_started_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [id],
            err => err ? reject(err) : resolve()
        );
    });
}

function markCompleted(id) {
    return new Promise((resolve, reject) => {

        console.log("markCompleted CALLED:", id);
        console.trace("markCompleted stack");

        db.run(
            `
            UPDATE original_videos
            SET
                status = 'completed',
                completed_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [id],
            err => err ? reject(err) : resolve()
        );
    });
}

function markFailed(id, error) {
    return new Promise((resolve, reject) => {

        console.log("markFailed CALLED:", id, error);
        console.trace("markFailed stack");

        db.run(
            `
            UPDATE original_videos
            SET
                status = 'failed',
                error_message = ?
            WHERE id = ?
            `,
            [error, id],
            err => err ? reject(err) : resolve()
        );
    });
}

const db = require("../database/database");

async function claimNextOriginal() {

    return new Promise((resolve, reject) => {

        db.serialize(() => {

            db.run("BEGIN IMMEDIATE TRANSACTION");

            db.all(
                `
                SELECT
                    id,
                    status,
                    used,
                    processing_started_at
                FROM original_videos
                `,
                [],
                (_, rows) => {
                    console.log("BEFORE CLAIM =", rows);
                }
            );

            db.get(
                `
                SELECT *
                FROM original_videos
                WHERE used = 0
                AND status = 'pending'
                ORDER BY created_at ASC
                LIMIT 1
                `,
                [],
                (err, row) => {

                    console.log("CLAIM RESULT =", row);

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
                        UPDATE original_videos
                        SET
                            used = 1,
                            status = 'processing',
                            processing_started_at = CURRENT_TIMESTAMP
                        WHERE id = ?
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

                                console.log("CLAIMED ID =", row.id);

                                resolve(row);

                            });

                        }
                    );

                }
            );

        });

    });

}

module.exports = {

    claimNextOriginal,
    markCompleted,
    markFailed

};
