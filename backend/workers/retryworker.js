const uploadQueue = require("../queues/uploadQueue");
const publishManager = require("../publishers/publishManager");
const logger = require("../services/logger");
const scheduler = require("../services/scheduler");

async function start() {

    console.log("================================");
    console.log(" AutoVideoPublisher Retry Worker ");
    console.log("================================");

    await logger.info(
        "retry_worker",
        "worker_started",
        "Retry Worker Started"
    );

    scheduler.start(async () => {

        let video;

        try {

            video = await retryQueue.getNextRetry();

            if (!video) {

                console.log("No failed uploads.");
                return;

            }

            console.log("Retry Upload:", video.id);

            await publishManager.publish(video);

            console.log("✅ Retry Successful");

            await logger.info(
                "retry_worker",
                "retry_success",
                "Upload retry successful",
                video.id
            );

        } catch (err) {

            console.error(err);

            await logger.error(
                "retry_worker",
                "retry_failed",
                err.stack || err.message,
                video ? video.id : null
            );

        }

    }, 30000);

}

start();