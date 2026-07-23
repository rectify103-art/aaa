const crypto = require("crypto");
const db = require("./database/database");


// Original Video

db.run(
`
INSERT INTO original_videos
(
id,
file_name,
file_path,
status
)
VALUES(?,?,?,?)
`,
[
crypto.randomUUID(),
"test_video.mp4",
"D:\\Projects\\AutoVideoPublisher\\storage\\original_videos\\bce9350d-907c-49e4-8795-94c2919f0ba6-WhatsApp Video 2026-07-11 at 11.48.16 PM (1).mp4",
"pending"
]
);



// Result Clip

db.run(
`
INSERT INTO result_clips
(
id,
file_name,
file_path,
status
)
VALUES(?,?,?,?)
`,
[
crypto.randomUUID(),
"test_clip.mp4",
"D:\\Projects\\AutoVideoPublisher\\storage\\result_clips\\test_clip.mp4",
"available"
]
);


console.log("Test media inserted");