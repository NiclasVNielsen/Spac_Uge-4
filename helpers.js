const fs = require("fs");
const { mkdir } = require("fs/promises");
const { Readable } = require('stream');
const { finished } = require('stream/promises');
const path = require("path");

module.exports.downloadFile = (async (url, fileName) => {
    try {
        const res = await fetch(url);
        /* const destination = path.resolve("./files", fileName + ".pdf");
        const fileStream = fs.createWriteStream(destination, { flags: 'wx' });
        await finished(Readable.fromWeb(res.body).pipe(fileStream)); */
        return 200
    } catch (error) {
        console.error("Couldn't Download " + fileName)
        return 404
    }
});