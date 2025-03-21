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
         //console.error("Couldn't Download " + fileName + " at " + url)
        return 404
    }
});


// Simple 2D array sort function
// source: https://stackoverflow.com/questions/16096872/how-to-sort-2-dimensional-array-by-column-value
function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}


// Formats the output report file
module.exports.formatResults = ((succededDownloads, failedDownloads) => {
    const result = []

    for(let i = 0; i < succededDownloads.length; i++){
        result.push([succededDownloads[i], "yes"])
    }
    
    for(let i = 0; i < failedDownloads.length; i++){
        result.push([failedDownloads[i], "no"])
    }

    result.sort(sortFunction)

    return result
})


module.exports.writeCSV = (rawData) => {
    let data = "BRnum;downloaded?;\n"

    rawData.forEach(e => {
        data += `${e[0]};${e[1]};\n`
    })

    // Write the file
    // source: https://www.geeksforgeeks.org/node-js-fs-writefile-method/
    fs.writeFile("./result/results.csv", data, (err) => {
        if (err) console.log(err);
    });
}