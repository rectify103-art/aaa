// const path = require("path");
const crypto = require("crypto");

const mediaPackage = require("./mediaPackage");
const titleGenerator = require("./titleGenerator");
const ffmpeg = require("./ffmpeg");
const logger = require("./logger");

const renderQueue = require("../queues/renderQueue");
const clipQueue = require("../queues/clipQueue");

const packageQueue = require("../queues/packageQueue");

const generatedQueue = require("../queues/generatedQueue");





async function render() {



        let video;
        let clip;
        let packageData;

        try {


    const generatedId = crypto.randomUUID();

    const outputName = crypto.randomUUID() + ".mp4";

    console.log("=== RENDER START ===");

        video = await renderQueue.claimNextOriginal();

        if (!video) {
            throw new Error("No original video available");
        }

        await logger.info(
            "render",
            "render_started",
            "Started rendering video",
            video.id
        );

    clip = await clipQueue.claimNextClip();
    console.log("CLIP =", clip);

    if (!clip) {
        throw new Error("No result clip available");
    }

    packageData = await packageQueue.claimNextPackage();
    console.log("PACKAGE =", packageData);

    if (!packageData) {
        throw new Error("No music package available");
    }

    const metadata = mediaPackage.readMetadata(
        packageData.package_name
    );

    const titleData = titleGenerator.generateTitle(
        metadata
    );

    const musicPath = mediaPackage.getMusicPath(
        packageData.package_name
    );


    console.log("Original:", video.file_path);
    console.log("Clip:", clip.file_path);
    console.log("Music:", musicPath);

    // Merge original + result clip
    const mergedVideo = await ffmpeg.mergeVideos(
        video.file_path,
        clip.file_path,
        "merged_" + outputName
    );

    await logger.info(
        "render",
        "merge_completed",
        "Original and clip merged",
        video.id
    );

    console.log("Merged video:", mergedVideo);

    // Add background music
    const finalVideo = await ffmpeg.addMusic(
        mergedVideo,
        musicPath,
        outputName
    );

    await logger.info(
        "render",
        "music_added",
        "Background music added",
        video.id
    );

    console.log("Final video:", finalVideo);




await generatedQueue.saveGeneratedVideo({

    id: generatedId,

    originalId: video.id,

    clipId: clip.id,

    packageId: packageData.id,

    packageName: packageData.package_name,

    title: titleData.title,

    description: titleData.fullDescription,

    tags: titleData.tags || [],

    categoryId:
        metadata.youtube?.categoryId || "22",

    privacyStatus:
        metadata.youtube?.privacyStatus || "public",

    madeForKids:
        metadata.youtube?.madeForKids,

    outputFile: finalVideo

});

console.log("Generated video saved.");

await clipQueue.markCompleted(clip.id);

await packageQueue.markCompleted(packageData.id);

// ===== DEBUG START =====
console.log(">>> BEFORE markCompleted", video.id);

await renderQueue.markCompleted(video.id);

console.log(">>> AFTER markCompleted", video.id);
// ===== DEBUG END =====

await logger.info(
    "render",
    "render_completed",
    "Generated video saved",
    generatedId
);

console.log("=== RENDER COMPLETE ===");

return {

    id: generatedId,

    file: finalVideo,

    title: titleData.title,

    description: titleData.fullDescription,

    tags: titleData.tags || [],

    categoryId: metadata.youtube?.categoryId || "22",

    privacyStatus: metadata.youtube?.privacyStatus || "public",

    madeForKids: metadata.youtube?.madeForKids ? true : false

};

    }
    catch (err) {

       if (packageData) {

         await packageQueue.markFailed(packageData.id);

        }

        if (clip) {

            await clipQueue.markFailed(clip.id);

        }

        if (video) {

            await renderQueue.markFailed(video.id, err.message);

            await logger.error(
                "render",
                "render_failed",
                err.message,
                video.id
            );

        }

        throw err;

    }
}

module.exports = {

    render

};
