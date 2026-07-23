const renderEngine = require("../services/renderEngine");
const db = require("../database/database");

const recovery = require("../services/recovery");
const scheduler = require("../services/scheduler");
const startup = require("../services/startup");
const logger = require("../services/logger");

let isRendering = false;




process.on("unhandledRejection", async (err) => {

    console.error("UNHANDLED REJECTION");
    console.error(err);

    try {

        const logger = require("../services/logger");

        await logger.error(
            "worker",
            "unhandled_rejection",
            err.stack || err.message
        );

    } catch {}

});

process.on("uncaughtException", async (err) => {

    console.error("UNCAUGHT EXCEPTION");
    console.error(err);

    try {

        const logger = require("../services/logger");

        await logger.error(
            "worker",
            "uncaught_exception",
            err.stack || err.message
        );

    } catch {}

    process.exit(1);

});


async function initializeWorker() {

    await logger.info(
        "worker",
        "worker_boot",
        "Queue Worker Started"
    );

    console.log("Worker initialized.");
}

async function start() {



    console.log("=================================");
    console.log(" AutoVideoPublisher Queue Worker ");
    console.log("=================================");

    await startup.initialize();

    await recovery.recoverInterruptedJobs();

    await initializeWorker();


    
    let shuttingDown = false;

    async function shutdown(signal) {

        if (shuttingDown)
            return;

        shuttingDown = true;

        console.log(`\n${signal} received.`);
        console.log("Stopping Queue Worker...");

        try {

            scheduler.stop?.();

        } catch {}

        try {

            await logger.info(
                "worker",
                "shutdown",
                `Queue Worker stopped by ${signal}`
            );

        } catch {}

        process.exit(0);

    }

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));


    scheduler.start(async () => {

        if (isRendering) {
            return;
        }

        isRendering = true;

        try {

            db.all(
                `
                SELECT id, status, used
                FROM original_videos
                `,
                [],
                (_, rows) => {
                    console.log("ORIGINAL VIDEOS =", rows);
                }
            );

            const generatedVideo = await renderEngine.render();

            if (!generatedVideo) {

                console.log("Nothing rendered.");

            } else {

                console.log(
                    "Render completed:",
                    generatedVideo.id
                );

            }

        } catch (err) {

            if (
                err.message.includes("No original video") ||
                err.message.includes("No result clip") ||
                err.message.includes("No music package")
            ) {

                console.log("Waiting for new content...");
                console.log("Reason:", err.message);

            } else {

                console.error(err);

            }

        } finally {

            isRendering = false;

        }

    }, 5000);

}

start();