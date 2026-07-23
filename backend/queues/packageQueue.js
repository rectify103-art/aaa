const db = require("../database/database");

async function claimNextPackage() {

    return new Promise((resolve, reject) => {

        db.serialize(() => {

            db.run("BEGIN IMMEDIATE TRANSACTION");

            db.get(
                `
                SELECT *
                FROM music_packages
                WHERE active = 1
                ORDER BY
                    used_count ASC,
                    created_at ASC
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
                        UPDATE music_packages
                        SET
                            active = 0
                        WHERE id = ?
                        `,
                        [row.id],
                        err => {

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
            UPDATE music_packages
            SET
                active = 1,
                used_count = used_count + 1,
                last_used = CURRENT_TIMESTAMP
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
            UPDATE music_packages
            SET active = 1
            WHERE id = ?
            `,
            [id],
            err => err ? reject(err) : resolve()
        );

    });

}

module.exports = {
    claimNextPackage,
    markCompleted,
    markFailed
};