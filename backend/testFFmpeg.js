const ffmpeg = require("./services/ffmpeg");


const video = 
"D:\\Projects\\AutoVideoPublisher\\storage\\original_videos\\bce9350d-907c-49e4-8795-94c2919f0ba6-WhatsApp Video 2026-07-11 at 11.48.16 PM (1).mp4";


const music =
"D:\\Projects\\AutoVideoPublisher\\storage\\media_packages\\package001\\music.mp3";


async function test(){

    try{

        const output = await ffmpeg.addMusic(
            video,
            music,
            "test_output.mp4"
        );


        console.log("SUCCESS:");
        console.log(output);

    }
    catch(err){

        console.error(err.message);

    }

}


test();