const fs = require("fs");
const path = require("path");
const http = require("http");
const open = require("open").default;
const { google } = require("googleapis");
const tokenManager = require("./tokenManager");

const CONFIG_DIR = path.join(__dirname, "../config");

const CREDENTIALS_PATH = path.join(
    CONFIG_DIR,
    "client_secret.json"
);


const REDIRECT_URI = "http://localhost:3000/oauth2callback";

function loadCredentials() {

    if (!fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error(
            "client_secret.json not found:\n" +
            CREDENTIALS_PATH
        );
    }

    const credentials = JSON.parse(
        fs.readFileSync(
            CREDENTIALS_PATH,
            "utf8"
        )
    );

    const config =
        credentials.installed ||
        credentials.web;

    return new google.auth.OAuth2(
        config.client_id,
        config.client_secret,
        REDIRECT_URI
    );

}


async function authorize() {

    const oauth2Client = loadCredentials();

    const savedToken = tokenManager.loadToken();

    if (savedToken) {

        if (tokenManager.isExpired(savedToken)) {

            console.log("Access token expired.");
            console.log("Google will refresh it automatically.");

        }

        oauth2Client.setCredentials(savedToken);

        oauth2Client.on("tokens", (tokens) => {

            const current =
                tokenManager.loadToken() || {};

            tokenManager.saveToken({

                ...current,
                ...tokens

            });

            console.log("OAuth token refreshed.");

        });

        return oauth2Client;

    }

    return await getNewToken(oauth2Client);

}




function getNewToken(oauth2Client) {

    return new Promise(
        async (resolve, reject) => {

            const authUrl =
                oauth2Client.generateAuthUrl({

                    access_type: "offline",

                    prompt: "consent",

                    scope: [
                        "https://www.googleapis.com/auth/youtube.upload"
                    ]

                });

            console.log("\n================================");
            console.log("OPENING GOOGLE LOGIN...");
            console.log("================================\n");

            await open(authUrl);

            const server =
                http.createServer(
                    async (req, res) => {

                        if (
                            !req.url.startsWith(
                                "/oauth2callback"
                            )
                        ) {
                            return;
                        }

                        const url =
                            new URL(
                                req.url,
                                REDIRECT_URI
                            );

                        const code =
                            url.searchParams.get(
                                "code"
                            );

                        res.end(
                            "Authorization successful. You can close this window."
                        );

                        server.close();

                        try {

                            const {
                                tokens
                            } =
                                await oauth2Client.getToken(
                                    code
                                );

                            oauth2Client.setCredentials(
                                tokens
                            );

                            tokenManager.saveToken(tokens);

                            console.log(
                                "\nToken saved successfully.\n"
                            );

                            resolve(
                                oauth2Client
                            );

                        }
                        catch (err) {

                            reject(err);

                        }

                    }
                );

            server.listen(
                3000,
                () => {

                    console.log(
                        "Waiting for Google authorization..."
                    );

                }
            );

        }
    );

}

module.exports = {

    authorize

};