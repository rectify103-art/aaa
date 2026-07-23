const crypto = require("crypto");

const TITLE_TEMPLATES = [
    "Amazing Video You Need To Watch 🔥",
    "This Moment Is Incredible 😱",
    "You Won't Believe What Happens Next 🚀",
    "Best Viral Content Of The Day 🔥",
    "Watch Till The End 👀",
    "Trending Video Everyone Is Watching"
];



function randomTitle() {

    const index = Math.floor(
        Math.random() * TITLE_TEMPLATES.length
    );

    return TITLE_TEMPLATES[index];

}



function cleanHashtags(tags) {

    if (!tags) {
        return [];
    }

    if (Array.isArray(tags)) {
        return tags;
    }

    try {

        return JSON.parse(tags);

    } catch {

        return tags
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

    }

}



function cleanTags(tags) {

    if (!tags) {
        return [];
    }

    if (Array.isArray(tags)) {
        return tags;
    }

    try {

        return JSON.parse(tags);

    } catch {

        return tags
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

    }

}


function generateTitle(metadata = {}) {

    const title = randomTitle();

    const hashtagArray = cleanHashtags(
        metadata.hashtags
    );

    const tagArray = cleanTags(
        metadata.tags
    );

    const aiDescription =
        metadata.description || "";

    const defaultDescription =
        metadata.defaultDescription || "";

    const hashtagString =
        hashtagArray.join(" ");

    const fullDescription = [
        aiDescription,
        "",
        defaultDescription,
        "",
        hashtagString
    ].join("\n").trim();

    return {

        id: crypto.randomUUID(),

        title,

        description: aiDescription,

        defaultDescription,

        hashtags: hashtagArray,

        tags: tagArray,

        fullDescription

    };

}


function generateFromPackage(packageData) {

    return generateTitle({

        description:
            packageData.description,

        defaultDescription:
            packageData.defaultDescription,

        hashtags:
            packageData.hashtags,

        tags:
            packageData.tags

    });

}



module.exports = {

    generateTitle,

    generateFromPackage

};