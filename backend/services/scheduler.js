let timer = null;
let running = false;

function start(job, interval = 5000) {

    if (running)
        return;

    running = true;

    console.log("[INFO] scheduler: scheduler_started");

    timer = setInterval(async () => {

        try {

            await job();

        }
        catch (err) {

            console.error("[SCHEDULER ERROR]");
            console.error(err);

        }

    }, interval);

}

function stop() {

    if (!running)
        return;

    clearInterval(timer);

    timer = null;
    running = false;

    console.log("[INFO] scheduler: scheduler_stopped");

}

function isRunning() {

    return running;

}

module.exports = {

    start,
    stop,
    isRunning

};