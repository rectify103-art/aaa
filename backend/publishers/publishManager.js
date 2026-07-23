const youtubePublisher = require("./youtubePublisher");
// const facebookPublisher = require("./facebookPublisher");
// const instagramPublisher = require("./instagramPublisher");
// const tiktokPublisher = require("./tiktokPublisher");

const logger = require("../services/logger");

async function publish(video) {

    await logger.info(
        "publisher",
        "publish_started",
        "Publishing started",
        video.id
    );

    const results = {};

    try {

        results.youtube =
            await youtubePublisher.publish(video);

        /*
        results.facebook =
            await facebookPublisher.publish(video);

        results.instagram =
            await instagramPublisher.publish(video);

        results.tiktok =
            await tiktokPublisher.publish(video);
        */

        await logger.info(
            "publisher",
            "publish_completed",
            "Publishing completed",
            video.id
        );

        return results;

    } catch (err) {

        await logger.error(
            "publisher",
            "publish_failed",
            err.stack || err.message,
            video.id
        );

        throw err;

    }

}

module.exports = {
    publish
};