const fs = require("fs");
const { google } = require("googleapis");

const db = require("../database/database");
const auth = require("../services/googleAuth");const logger = require("./logger");

function updateSuccess(id, youtubeId) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            UPDATE generated_videos
            SET
                status='uploaded',
                youtube_video_id=?,
                youtube_url=?,
                upload_time=CURRENT_TIMESTAMP
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

function updateError(id, error) {

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

async function uploadVideo(video) {

    if (!video) {

        console.log("No video to upload.");
        return null;

    }

    await logger.info(
        "uploader",
        "upload_started",
        "Starting YouTube upload",
        video.id
    );

    const oauth2Client = await auth.authorize();

    const youtube = google.youtube({

        version: "v3",
        auth: oauth2Client

    });

    console.log("\n========== REQUEST BODY ==========");
    console.log(JSON.stringify({

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

    }, null, 4));
    console.log("==================================\n");

    try {

        console.log("Uploading...");
        console.log(video.file);

        const response = await youtube.videos.insert({

            part: [
                "snippet",
                "status"
            ],

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
            "uploader",
            "upload_completed",
            `Uploaded to https://youtu.be/${youtubeId}`,
            video.id
        );

        console.log("Upload Complete");
        console.log(`https://youtu.be/${youtubeId}`);

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
            "uploader",
            "upload_failed",
            err.message,
            video.id
        );

        throw err;

    }

}

module.exports = {

    uploadVideo

};