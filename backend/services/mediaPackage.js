const fs = require("fs");
const path = require("path");

const db = require("../database/database");


const STORAGE_PATH = path.join(
    __dirname,
    "../../storage/media_packages"
);


// List all active packages
function listPackages(){

    return new Promise((resolve, reject)=>{

        db.all(
            `
            SELECT *
            FROM music_packages
            WHERE active = 1
            ORDER BY created_at ASC
            `,
            [],
            (err, rows)=>{

                if(err){
                    return reject(err);
                }

                resolve(rows);

            }
        );

    });

}




function getPackageById(id){

    return new Promise((resolve,reject)=>{

        db.get(
            `
            SELECT *
            FROM music_packages
            WHERE id = ?
            `,
            [id],
            (err,row)=>{

                if(err){
                    return reject(err);
                }

                resolve(row);

            }
        );

    });

}






// Get single package
function getPackage(id){

    return new Promise((resolve, reject)=>{

        db.get(
            `
            SELECT *
            FROM music_packages
            WHERE id = ?
            `,
            [id],
            (err,row)=>{

                if(err){
                    return reject(err);
                }

                resolve(row);

            }
        );

    });

}



// Round Robin package selection
function getNextPackage(){

    return new Promise((resolve,reject)=>{

        db.get(
            `
            SELECT *
            FROM music_packages
            WHERE active = 1
            ORDER BY used_count ASC,
                     created_at ASC
            LIMIT 1
            `,
            [],
            (err,row)=>{

                if(err){
                    return reject(err);
                }


                if(!row){

                    return reject(
                        new Error(
                            "No active media package found"
                        )
                    );

                }


                resolve(row);

            }
        );

    });

}



// Mark package used
function markPackageUsed(id){

    return new Promise((resolve,reject)=>{

        db.run(
            `
            UPDATE music_packages
            SET
            used_count = used_count + 1,
            last_used = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [id],
            function(err){

                if(err){
                    return reject(err);
                }


                resolve(true);

            }
        );

    });

}



// Read metadata.json
function readMetadata(packageName){

    try{

        const file = path.join(
            STORAGE_PATH,
            packageName,
            "metadata.json"
        );


        if(!fs.existsSync(file)){
            return null;
        }


        return JSON.parse(
            fs.readFileSync(file,"utf8")
        );


    }
    catch(err){

        return null;

    }

}



// Get music file path
function getMusicPath(packageName){


    const file = path.join(
        STORAGE_PATH,
        packageName,
        "music.mp3"
    );


    if(!fs.existsSync(file)){

        throw new Error(
            "music.mp3 not found: " + file
        );

    }


    return file;

}



module.exports = {

    listPackages,
    getPackage,
    getPackageById,
    getNextPackage,
    markPackageUsed,
    readMetadata,
    getMusicPath

};