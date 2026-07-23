const mediaPackage = require("./services/mediaPackage");


async function test(){

    try {

        console.log("=== LIST PACKAGES ===");

        const packages = await mediaPackage.listPackages();

        console.log(packages);



        console.log("\n=== NEXT PACKAGE ===");

        const next = await mediaPackage.getNextPackage();

        console.log(next);



        console.log("\n=== METADATA ===");

        const metadata = mediaPackage.readMetadata(
            next.package_name
        );

        console.log(metadata);



        console.log("\n=== MUSIC PATH ===");

        const music = mediaPackage.getMusicPath(
            next.package_name
        );

        console.log(music);



        console.log("\n=== MARK USED ===");

        await mediaPackage.markPackageUsed(
            next.id
        );

        console.log("Package marked used");


    }
    catch(err){

        console.error(err.message);

    }

}


test();