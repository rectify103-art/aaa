const db = require("../database/database");

async function claimNextClip() {

    return new Promise((resolve, reject) => {

        db.serialize(() => {

            db.run("BEGIN IMMEDIATE TRANSACTION");

            db.all(
                `
                SELECT
                    id,
                    status,
                    used
                FROM result_clips
                `,
                [],
                (_, rows) => {
                    console.log("BEFORE CLIP CLAIM =", rows);
                }
            );

            db.get(
                `
                SELECT *
                FROM result_clips
                WHERE used = 0
                  AND status = 'available'
                ORDER BY created_at ASC
                LIMIT 1
                `,
                [],
                (err, row) => {

                    console.log("CLIP CLAIM RESULT =", row);

                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }

                    if (!row) {
                        db.run("COMMIT");
                        return resolve(null);
                    }

                    console.log("CLAIMED CLIP =", row.id);

                    db.run(
                        `
                        UPDATE result_clips
                        SET
                            used = 1,
                            status = 'processing'
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

                                resolve(row);

                            });

                        }
                    );

                }

            );

        });

    });

}

async function markCompleted(id) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            UPDATE result_clips
            SET
                status = 'used'
            WHERE id = ?
            `,
            [id],
            err => err ? reject(err) : resolve()
        );

    });

}

async function markFailed(id) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            UPDATE result_clips
            SET
                used = 0,
                status = 'available'
            WHERE id = ?
            `,
            [id],
            err => err ? reject(err) : resolve()
        );

    });

}

module.exports = {

    claimNextClip,
    markCompleted,
    markFailed

};