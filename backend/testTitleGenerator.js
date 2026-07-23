const titleGenerator = require("./services/titleGenerator");


const metadata = {

    description:
    "Default description for all uploads.",


    hashtags:[
        "#shorts",
        "#viral",
        "#fyp"
    ]

};



const result =
titleGenerator.generateTitle(metadata);



console.log(result);