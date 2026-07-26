const fs = require("fs");
const path = require("path");

const { run, get, all } = require("../database/database");

const STORAGE_PATH = path.join(
    __dirname,
    "../../storage/media_packages"
);

/**
 * Get all active packages
 */
async function listPackages() {

    return all(
        `
        SELECT *
        FROM music_packages
        WHERE active = 1
        ORDER BY created_at ASC
        `
    );

}

/**
 * Get package by id
 */
async function getPackage(id) {

    return get(
        `
        SELECT *
        FROM music_packages
        WHERE id = ?
        `,
        [id]
    );

}

/**
 * Get next package (Round Robin)
 */
async function getNextPackage() {

    const row = get(
        `
        SELECT *
        FROM music_packages
        WHERE active = 1
        ORDER BY used_count ASC,
                 created_at ASC
        LIMIT 1
        `
    );

    if (!row) {
        throw new Error("No active media package found.");
    }

    return row;

}

/**
 * Increase package usage
 */
async function markPackageUsed(id) {

    run(
        `
        UPDATE music_packages
        SET
            used_count = used_count + 1,
            last_used = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [id]
    );

    return true;

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

    } catch (err) {

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