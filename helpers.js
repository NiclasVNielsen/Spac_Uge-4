const fs = require("fs");
const { mkdir } = require("fs/promises");
const { Readable } = require('stream');
const { finished } = require('stream/promises');
const path = require("path");

// Downloads file from link and renames the file
module.exports.downloadFile = (async (url, fileName) => {
    try {
        // Tries to fetch the file
        const res = await fetch(url);

        // Determinates where the file is downloaded and it's name
        /* const destination = path.resolve("./files", fileName + ".pdf");
        
        // Ehhhmm?? idk what this does, my guess is that it opens a stream for the file to be written
        const fileStream = fs.createWriteStream(destination, { flags: 'wx' });
        await finished(Readable.fromWeb(res.body).pipe(fileStream)); */

        // Wohooo! the file was downloaded
        return 200
    } catch (error) {
        // Ooof.. the download didn't work
        console.error("Couldn't Download " + fileName + " at " + url)
        return 404
    }
});