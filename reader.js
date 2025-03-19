const fs = require("fs");
const csvParser = require("csv-parser");
const { downloadFile } = require("./helpers")

// csv settings
const fileName = "GRI_2017_2020.csv"
const delimiter = ";"
//==============

// Contains the data from the csv file
const results = []

const multiDownload = async (dataset, field = "Pdf_URL") => {
    // Stores all the downloads as promises, this allows us to await them later
    const promises = []

    //Goes through every row in the dataset
    dataset.forEach(async (data, index) => {
        // index < 10 is to limit the dataset
        if(index < 10){
            promises.push(new Promise(resolve => {
                // js is being stupid so have to take BRnum by data[key[0]] instead of data['BRnum'] - key[0] === 'BRnum' = true, but for some reason 'BRnum' fails
                const keys = Object.keys(data);

                // data[field] = url to download pdf, data[keys[0]] = BRnum that the file should be named after
                const status = downloadFile(data[field], data[keys[0]])

                // gives 200 or 404 depending on wheather it found something or not
                resolve(status)
            }))
        }
    })

    // Returns the promises so they can be awaited outside of this function
    return promises
}

const filterOutSuccededDownloads = (downloadReults) => {
    const failedDownloads = []
    // If the pdf file could not be found, push the row into the array where we will try the secondary source
    downloadReults.forEach((result, index) => {
        if(result == 404){
            failedDownloads.push(results[index])
        }
    })
    // Returns array of rows that failed to download
    return failedDownloads
}


fs.createReadStream("./" + fileName)
.pipe(csvParser({
    separator: delimiter
}))
.on("data", (data) => {
    // Extract the Data from the csv file
    results.push(data);
})
.on("end", async () => {
    // Tries to download all the pdf files through the primary source
    const firstPromises = await multiDownload(results, "Pdf_URL")

    // Waits for all the downloads to have a final response
    Promise.all(firstPromises)
    .then(async (result) => {
        // Creates a new array with all the failed downloads
        const failedDownloads = filterOutSuccededDownloads(result)

        // Tries to download all the failed ones from their secondary source
        const secondPromises = await multiDownload(failedDownloads, "Report Html Address")

        Promise.all(secondPromises)
        .then(async (result) => {
            // status all of all the second downloads
            console.log(result)
        })

    })
});