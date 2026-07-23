const renderEngine = require("./services/renderEngine");

async function start() {
    try {
        const result = await renderEngine.render();

        console.log("\n========================");
        console.log("RENDER SUCCESS");
        console.log("========================");
        console.log(result);
    } catch (err) {
        console.error("\n========================");
        console.error("RENDER FAILED");
        console.error("========================");
        console.error(err);
    }
}

start();