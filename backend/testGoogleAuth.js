const auth = require("../services/googleAuth");
(async () => {

    try {

        await auth.authorize();

        console.log("\n======================");
        console.log("GOOGLE LOGIN SUCCESS");
        console.log("======================");

        process.exit(0);

    } catch (err) {

        console.error(err);

        process.exit(1);

    }

})();