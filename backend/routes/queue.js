const express = require("express");

const router = express.Router();

const queue = require("../services/queue");


router.get("/next", async (req,res)=>{

    try{

        const video = await queue.getNextOriginalVideo();

        const clip = await queue.getNextResultClip();

        res.json({

            success:true,

            video,

            clip

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            error:error.message

        });

    }

});


module.exports = router;