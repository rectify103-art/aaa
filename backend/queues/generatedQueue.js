const db = require("../database/database");

async function saveGeneratedVideo(data) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            INSERT INTO generated_videos
            (
                id,
                original_video_id,
                result_clip_id,
                music_package_id,
                package_name,
                title,
                description,
                tags,
                category_id,
                privacy_status,
                made_for_kids,
                output_file,
                status
            )
            VALUES
            (?,?,?,?,?,?,?,?,?,?,?,?,?)
            `,
            [
                data.id,
                data.originalId,
                data.clipId,
                data.packageId,
                data.packageName,
                data.title,
                data.description,
                JSON.stringify(data.tags || []),
                data.categoryId,
                data.privacyStatus,
                data.madeForKids ? 1 : 0,
                data.outputFile,
                "completed"
            ],
            err => {

                if (err)
                    return reject(err);

                resolve();

            }

        );

    });

}

module.exports = {
    saveGeneratedVideo
};