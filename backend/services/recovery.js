const db = require("../database/database");

function recoverInterruptedJobs() {

    return new Promise((resolve, reject) => {

        db.serialize(() => {

            db.run("BEGIN IMMEDIATE TRANSACTION");

            db.run(
                `
                UPDATE original_videos
                SET
                    status='pending',
                    used=0,
                    processing_started_at=NULL
                WHERE status='processing'
                `,
                function (err) {

                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }

                    const recoveredOriginals = this.changes;

                    db.run(
                        `
                        UPDATE result_clips
                        SET
                            used=0,
                            status='available'
                        WHERE status='processing'
                        `,
                        function (err) {

                            if (err) {
                                db.run("ROLLBACK");
                                return reject(err);
                            }

                            const recoveredClips = this.changes;

                            db.run("COMMIT", err => {

                                if (err)
                                    return reject(err);

                                console.log(`Recovered originals: ${recoveredOriginals}`);
                                console.log(`Recovered clips: ${recoveredClips}`);

                                resolve();

                            });

                        }
                    );

                }
            );

        });

    });

}

module.exports = {
    recoverInterruptedJobs
};