const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuid } = require("uuid");

const db = require("../database/database");

const router = express.Router();


// ===============================
// Storage Configuration
// ===============================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        const type = req.body.type;

        if (type === "original") {

            cb(
                null,
                path.join(__dirname, "../../storage/original_videos")
            );

        } 
        else if (type === "clip") {

            cb(
                null,
                path.join(__dirname, "../../storage/result_clips")
            );

        } 
        else {

            cb(new Error("Invalid upload type"));

        }

    },


    filename: (req, file, cb) => {

        const filename =
            uuid() + "-" + file.originalname;

        cb(null, filename);

    }

});



// ===============================
// Multer Configuration
// ===============================

const upload = multer({

    storage: storage,

    limits: {

        fileSize: 1024 * 1024 * 500 // 500 MB

    },


    fileFilter: (req, file, cb) => {

        console.log("FILE NAME:", file.originalname);
        console.log("FILE TYPE:", file.mimetype);


        const allowedExtensions = [
            ".mp4",
            ".mov",
            ".avi",
            ".mkv",
            ".webm"
        ];


        const ext = path.extname(file.originalname)
            .toLowerCase();


        if (allowedExtensions.includes(ext)) {

            cb(null, true);

        } else {

            cb(new Error("Only video files allowed"));

        }

    }
});




// ===============================
// Upload API
// ===============================

router.post("/", (req, res) => {


    upload.single("video")(req, res, (err) => {


        if (err) {


            console.log(
                "UPLOAD ERROR:",
                err.message
            );


            return res.status(500).json({

                success:false,

                error:err.message

            });

        }



        if (!req.file) {


            return res.status(400).json({

                success:false,

                error:"No video file received"

            });

        }



        const type = req.body.type;


        const id = uuid();



        console.log(
            "Uploaded:",
            req.file.filename
        );





        // ===============================
        // Save Original Video
        // ===============================

        if (type === "original") {


            db.run(

                `
                INSERT INTO original_videos
                (
                    id,
                    file_name,
                    file_path,
                    status,
                    used
                )
                VALUES
                (?,?,?,?,?)
                `,


                [

                    id,

                    req.file.filename,

                    req.file.path,

                    "pending",

                    0

                ]

            );


        }





        // ===============================
        // Save Result Clip
        // ===============================

        else if (type === "clip") {


            db.run(

                `
                INSERT INTO result_clips
                (
                    id,
                    file_name,
                    file_path,
                    status,
                    used
                )
                VALUES
                (?,?,?,?,?)
                `,


                [

                    id,

                    req.file.filename,

                    req.file.path,

                    "available",

                    0

                ]

            );


        }





        else {


            return res.status(400).json({

                success:false,

                error:
                "Invalid type. Use original or clip"

            });


        }





        res.json({

            success:true,

            message:
            "Video uploaded successfully",

            id:id,

            file:
            req.file.filename,

            type:type

        });



    });


});





module.exports = router;