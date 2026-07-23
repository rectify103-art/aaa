const db = require("../database/database");



// ==============================
// Get Next Original Video
// ==============================

function getNextOriginalVideo() {

    return new Promise((resolve, reject) => {

        db.get(

            `
            SELECT *
            FROM original_videos

            WHERE

            used=0
            AND status='pending'

            ORDER BY created_at ASC

            LIMIT 1
            `,

            [],

            (err,row)=>{

                if(err){

                    reject(err);

                }else{

                    resolve(row);

                }

            }

        );

    });

}



// ==============================
// Get Next Result Clip
// ==============================

function getNextResultClip(){

    return new Promise((resolve,reject)=>{

        db.get(

            `
            SELECT *

            FROM result_clips

            WHERE

            used=0
            AND status='available'

            ORDER BY created_at ASC

            LIMIT 1
            `,

            [],

            (err,row)=>{

                if(err){

                    reject(err);

                }else{

                    resolve(row);

                }

            }

        );

    });

}



// ==============================
// Update Video Status
// ==============================

function markVideoProcessing(id){

    return new Promise((resolve,reject)=>{

        db.run(

            `
            UPDATE original_videos

            SET status='processing'

            WHERE id=?
            `,

            [id],

            function(err){

                if(err){

                    reject(err);

                }else{

                    resolve(true);

                }

            }

        );

    });

}



// ==============================
// Update Clip Used
// ==============================

function markClipUsed(id){

    return new Promise((resolve,reject)=>{

        db.run(

            `
            UPDATE result_clips

            SET

            used=1,
            status='used'

            WHERE id=?
            `,

            [id],

            function(err){

                if(err){

                    reject(err);

                }else{

                    resolve(true);

                }

            }

        );

    });

}



module.exports={

    getNextOriginalVideo,

    getNextResultClip,

    markVideoProcessing,

    markClipUsed

};