const fs = require("fs");
const path = require("path");

const TOKEN_PATH = path.join(
    __dirname,
    "../config/token.json"
);

function loadToken() {

    if (!fs.existsSync(TOKEN_PATH)) {
        return null;
    }

    return JSON.parse(
        fs.readFileSync(TOKEN_PATH, "utf8")
    );

}

function saveToken(token) {

    fs.writeFileSync(
        TOKEN_PATH,
        JSON.stringify(token, null, 4)
    );

}

function isExpired(token) {

    if (!token)
        return true;

    if (!token.expiry_date)
        return false;

    return Date.now() >= token.expiry_date;

}

module.exports = {

    loadToken,
    saveToken,
    isExpired

};