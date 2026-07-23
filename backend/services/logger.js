const crypto = require("crypto");
const db = require("../database/database");

function write(level, module, event, message, referenceId = null) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            INSERT INTO logs
            (
                id,
                level,
                module,
                event,
                message,
                reference_id
            )
            VALUES
            (?,?,?,?,?,?)
            `,
            [
                crypto.randomUUID(),
                level,
                module,
                event,
                message,
                referenceId
            ],
            err => {

                if (err)
                    return reject(err);

                resolve();

            }
        );

    });

}

async function info(module, event, message, referenceId = null) {

    console.log(`[INFO] ${module}: ${event}`);

    return write(
        "INFO",
        module,
        event,
        message,
        referenceId
    );

}

async function warning(module, event, message, referenceId = null) {

    console.warn(`[WARNING] ${module}: ${event}`);

    return write(
        "WARNING",
        module,
        event,
        message,
        referenceId
    );

}

async function error(module, event, message, referenceId = null) {

    console.error(`[ERROR] ${module}: ${event}`);

    return write(
        "ERROR",
        module,
        event,
        message,
        referenceId
    );

}

module.exports = {
    info,
    warning,
    error
};