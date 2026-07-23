const uploadQueue = require("../queues/uploadQueue");
const publishManager = require("../publishers/publishManager");
const logger = require("../services/logger");
const scheduler = require("../services/scheduler");

    let isUploading = false;


async function start() {

    console.log("===============================");
    console.log(" AutoVideoPublisher Upload Worker ");
    console.log("===============================");

    await logger.info(
        "upload_worker",
        "worker_started",
        "Upload Worker Started"
    );

        scheduler.start(async () => {


            if (isUploading) {
                return;
            }

            isUploading = true;

            let video;

            try {

                video = await uploadQueue.claimNextUpload();

                if (!video) {
                    console.log("No video waiting for upload.");
                    return;
                }

                console.log("Uploading:", video.id);

                await publishManager.publish(video);

                console.log("✅ Upload Complete");

            } catch (err) {

                console.error(err);

                if (video) {

                    await uploadQueue.markUploadFailed(
                        video.id,
                        err.message
                    );

                }

                await logger.error(
                    "upload_worker",
                    "upload_failed",
                    err.stack || err.message,
                    video ? video.id : null
                );

            } finally {

                isUploading = false;

            }

        }, 5000);

}

start();