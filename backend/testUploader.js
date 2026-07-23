const uploader = require("./services/uploader");

(async () => {

    try {

        console.log("\n====================");
        console.log("YOUTUBE UPLOAD TEST");
        console.log("====================\n");

        const result =
            await uploader.uploadNext();

        console.log("\n====================");
        console.log("UPLOAD SUCCESS");
        console.log("====================");
        console.log(result);

    } catch (err) {

        console.log("\n====================");
        console.log("UPLOAD FAILED");
        console.log("====================");
        console.error(err);

    }

})();