const fs = require("fs");
const path = require("path");
const { spawn, execFile } = require("child_process");

const OUTPUT_DIR = path.join(
    __dirname,
    "../../storage/generated_videos"
);

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, {
        recursive: true
    });
}

function ensureFile(file) {

    if (!fs.existsSync(file)) {

        throw new Error(
            "File not found:\n" + file
        );

    }

}

function outputFile(name) {

    return path.join(
        OUTPUT_DIR,
        name
    );

}

function ensureOutputRemoved(file) {

    if (fs.existsSync(file)) {

        fs.unlinkSync(file);

    }

}

function randomStart(duration, limit) {

    if (duration <= limit) {
        return 0;
    }

    return Math.floor(
        Math.random() *
        (duration - limit)
    );

}

function getDuration(file) {

    return new Promise(
        (resolve, reject) => {

            execFile(

                "ffprobe",

                [
                    "-v",
                    "error",

                    "-show_entries",
                    "format=duration",

                    "-of",
                    "default=noprint_wrappers=1:nokey=1",

                    file
                ],

                (err, stdout) => {

                    if (err) {

                        reject(err);
                        return;

                    }

                    resolve(
                        parseFloat(stdout)
                    );

                }

            );

        }
    );

}

function buildScaleFilter(index) {

    return (
        `[${index}:v]` +
        `scale=720:1280:` +
        `force_original_aspect_ratio=decrease,` +
        `pad=720:1280:` +
        `(ow-iw)/2:` +
        `(oh-ih)/2:` +
        `black,` +
        `setsar=1,` +
        `fps=30,` +
        `format=yuv420p` +
        `[v${index}]`
    );

}

function runFFmpeg(args) {

    return new Promise((resolve, reject) => {

        console.log("\n========== FFMPEG ==========");
        console.log("ffmpeg " + args.join(" "));
        console.log("============================\n");

        const ffmpeg = spawn(
            "ffmpeg",
            args,
            {
                windowsHide: true
            }
        );

        let stderr = "";
        let stdout = "";

        ffmpeg.stdout.on(
            "data",
            data => {

                stdout += data.toString();

            }
        );

        ffmpeg.stderr.on(
            "data",
            data => {

                const text = data.toString();

                stderr += text;

                process.stdout.write(text);

            }
        );

        ffmpeg.on(
            "error",
            err => {

                reject(err);

            }
        );

        ffmpeg.on(
            "close",
            code => {

                if (code !== 0) {

                    reject(
                        new Error(stderr)
                    );

                    return;

                }

                resolve({
                    stdout,
                    stderr
                });

            }
        );

    });

}

async function mergeVideos(
    original,
    clip,
    outputName
) {

    ensureFile(original);
    ensureFile(clip);

    const output =
        outputFile(outputName);

    ensureOutputRemoved(output);

    const originalDuration =
        await getDuration(original);

    const clipDuration =
        await getDuration(clip);

    const originalStart =
        randomStart(
            originalDuration,
            40
        );

    const clipStart =
        randomStart(
            clipDuration,
            20
        );

    console.log(
        "Original Duration:",
        originalDuration
    );

    console.log(
        "Clip Duration:",
        clipDuration
    );

    console.log(
        "Original Start:",
        originalStart
    );

    console.log(
        "Clip Start:",
        clipStart
    );

    const filter =

        buildScaleFilter(0) +
        ";" +

        buildScaleFilter(1) +
        ";" +

        "[v0][v1]" +
        "concat=n=2:v=1:a=0[v]";

    const args = [

        "-y",

        "-ss",
        originalStart.toString(),

        "-t",
        "40",

        "-i",
        original,

        "-ss",
        clipStart.toString(),

        "-t",
        "20",

        "-i",
        clip,

        "-filter_complex",
        filter,

        "-map",
        "[v]",

        "-an",

        "-c:v",
        "libx264",

        "-preset",
        "veryfast",

        "-crf",
        "23",

        "-pix_fmt",
        "yuv420p",

        "-movflags",
        "+faststart",

        output

    ];

    await runFFmpeg(args);

    if (!fs.existsSync(output)) {

        throw new Error(
            "Merged video not created:\n" +
            output
        );

    }

    return output;

}

async function addMusic(
    videoPath,
    musicPath,
    outputName
) {

    ensureFile(videoPath);
    ensureFile(musicPath);

    const output =
        outputFile(outputName);

    ensureOutputRemoved(output);

    const args = [

        "-y",

        "-stream_loop",
        "-1",

        "-i",
        musicPath,

        "-i",
        videoPath,

        "-filter_complex",

        "[0:a]volume=0.25[music];" +
        "[music]atrim=duration=60," +
        "asetpts=N/SR/TB[a]",

        "-map",
        "1:v",

        "-map",
        "[a]",

        "-c:v",
        "copy",

        "-c:a",
        "aac",

        "-b:a",
        "192k",

        "-shortest",

        "-movflags",
        "+faststart",

        output

    ];

    await runFFmpeg(args);

    if (!fs.existsSync(output)) {

        throw new Error(
            "Final video not created:\n" +
            output
        );

    }

    return output;

}

module.exports = {

    runFFmpeg,

    getDuration,

    mergeVideos,

    addMusic

};