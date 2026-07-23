const fs = require("fs");
const { google } = require("googleapis");

const db = require("../database/database");
const auth = require("../services/googleAuth");const logger = require("../services/logger");

async function updateSuccess(id, youtubeId) {

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
                `https://youtu.be/${youtubeId}`,
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

async function updateError(id, error) {

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

async function publish(video) {

    const oauth2Client = await auth.authorize();

    const youtube = google.youtube({
        version: "v3",
        auth: oauth2Client
    });

    try {

        await logger.info(
            "youtube",
            "upload_started",
            "Uploading to YouTube",
            video.id
        );

        const response = await youtube.videos.insert({

            part: ["snippet", "status"],

            requestBody: {

                snippet: {
                    title: video.title,
                    description: video.description,
                    tags: video.tags || [],
                    categoryId: video.categoryId || "22"
                },

                status: {
                    privacyStatus: video.privacyStatus || "public",
                    selfDeclaredMadeForKids: video.madeForKids || false
                }

            },

            media: {
                body: fs.createReadStream(video.file)
            }

        });

        const youtubeId = response.data.id;

        await updateSuccess(
            video.id,
            youtubeId
        );

        await logger.info(
            "youtube",
            "upload_completed",
            "YouTube upload completed",
            video.id
        );

        return {
            id: youtubeId,
            url: `https://youtu.be/${youtubeId}`
        };

    } catch (err) {

        await updateError(
            video.id,
            err.message
        );

        await logger.error(
            "youtube",
            "upload_failed",
            err.message,
            video.id
        );

        throw err;

    }

}

module.exports = {
    publish
};