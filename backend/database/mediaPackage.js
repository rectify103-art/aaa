const fs = require("fs");
const path = require("path");

const db = require("../database/database");

const STORAGE_PATH = path.join(
    __dirname,
    "../../storage/media_packages"
);

/**
 * Get all active packages
 */
function listPackages() {
    return new Promise((resolve, reject) => {

        db.all(
            `
            SELECT *
            FROM music_packages
            WHERE active = 1
            ORDER BY created_at ASC
            `,
            [],
            (err, rows) => {

                if (err) {
                    return reject(err);
                }

                resolve(rows);

            }
        );

    });
}


/**
 * Get package by id
 */
function getPackage(id) {

    return new Promise((resolve, reject) => {

        db.get(
            `
            SELECT *
            FROM music_packages
            WHERE id = ?
            `,
            [id],
            (err, row) => {

                if (err) {
                    return reject(err);
                }

                resolve(row);

            }
        );

    });

}


/**
 * Get next package (Round Robin)
 */
function getNextPackage() {

    return new Promise((resolve, reject) => {

        db.get(
            `
            SELECT *
            FROM music_packages
            WHERE active = 1
            ORDER BY used_count ASC,
                     created_at ASC
            LIMIT 1
            `,
            [],
            (err, row) => {

                if (err) {
                    return reject(err);
                }

                if (!row) {
                    return reject(
                        new Error("No active media package found.")
                    );
                }

                resolve(row);

            }
        );

    });

}


/**
 * Increase package usage
 */
function markPackageUsed(id) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            UPDATE music_packages
            SET
                used_count = used_count + 1,
                last_used = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [id],
            function (err) {

                if (err) {
                    return reject(err);
                }

                resolve(true);

            }
        );

    });

}


/**
 * Read metadata.json
 */
function readMetadata(packageName) {

    try {

        const metadataPath = path.join(
            STORAGE_PATH,
            packageName,
            "metadata.json"
        );

        if (!fs.existsSync(metadataPath)) {

            return null;

        }

        return JSON.parse(
            fs.readFileSync(metadataPath, "utf8")
        );

    }
    catch (err) {

        return null;

    }

}


/**
 * Get music path
 */
function getMusicPath(packageName) {

    const musicPath = path.join(
        STORAGE_PATH,
        packageName,
        "music.mp3"
    );

    if (!fs.existsSync(musicPath)) {

        throw new Error("music.mp3 not found.");

    }

    return musicPath;

}


module.exports = {

    listPackages,

    getPackage,

    getNextPackage,

    markPackageUsed,

    readMetadata,

    getMusicPath

};