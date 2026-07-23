const logger = require("./logger");

async function initialize() {

    console.log("Running startup checks...");

    await logger.info(
        "startup",
        "startup_complete",
        "Startup initialization completed"
    );

}

module.exports = {
    initialize
};