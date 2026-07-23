const health = require("./health");

async function renderDashboard() {

    const h = await health.getHealth();

    console.clear();

    console.log("======================================");
    console.log(" AutoVideoPublisher Dashboard");
    console.log("======================================");
    console.log("Updated:", new Date().toLocaleString());
    console.log();

    console.table(h);

}

async function start() {

    await renderDashboard(); // Start হওয়ার সাথে সাথেই একবার দেখাবে

    setInterval(async () => {

        try {

            await renderDashboard();

        } catch (err) {

            console.error("Dashboard Error:");
            console.error(err);

        }

    }, 10000);

}

start();