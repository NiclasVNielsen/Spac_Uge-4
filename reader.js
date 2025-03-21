const fs = require("fs");
const csvParser = require("csv-parser");
const { downloadFile, formatResults, writeCSV } = require("./helpers")


// Dynamicly finds the file name
const findFile = async () => {
    const fileName = await new Promise (async (res, rej) => {
        try {
            fs.readdir("../input", async (err, files) => {
                // Checks that there is only one file in the folder
                if(files.length == 1){
                    res(files[0])
                }
            })
        } catch (error) {
            console.error("There has to be exactly 1 file in the input folder")
            res("")
        }
    }) 
    return fileName
}


// Dynamicly finds the csv delimiter
const findDelimiter = async (fileName) => {
    const delimiter = await new Promise (async (res, rej) => {
        try {
            let del = undefined
            // Reads through first 50 characters of the file
            fs.readFile("../input/" + fileName, 'utf8', (err, data) => {
                for(let i = 0; i < 50; i++){
                    // If it finds a "," the delimiter is ,
                    if(data[i] == ",")
                        del = ","
                    // If it finds a ";" the delimiter is ;
                    if(data[i] == ";")
                        del = ";"
                }
                res(del)
            })
        } catch (error) {
            res(undefined)
        }
    }) 
    return delimiter
}


// Contains the data from the csv file
const data = []

// All BRnum's gets sorted into succeded or failed downlaod
const endResSuccededDownloads = []
const endResFailedDownloads = []


const multiDownload = async (datasets, field = "Pdf_URL") => {
    // Stores all the downloads as promises, this allows us to await them later
    const promises = []

    // Goes through every row in the datasets
    datasets.forEach(async (dataset, index) => {
        // index < 10 is to limit the datasetset
        if(index < 10){
            promises.push(new Promise(async resolve => {
                // js is being stupid so have to take BRnum by dataset[key[0]] instead of dataset['BRnum'] - key[0] === 'BRnum' = true, but for some reason 'BRnum' fails
                const keys = Object.keys(dataset);
                const BRnum = dataset[keys[0]]

                // dataset[field] = url to download pdf, BRnum = what the filename should be
                const status = await downloadFile(dataset[field], BRnum)

                // Sorts the failed and success statuses of the downloads
                if(status == 200 && endResFailedDownloads.indexOf(BRnum) == -1){
                    endResSuccededDownloads.push(BRnum)
                }else if (status == 200){
                    endResSuccededDownloads.push(BRnum)
                    endResFailedDownloads.filter(e => e != BRnum) 
                }else if (endResFailedDownloads.indexOf(BRnum) == -1){
                    endResFailedDownloads.push(BRnum)
                }

                // Gives 200 or 404 depending on wheather it found something or not
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
            failedDownloads.push(data[index])
        }
    })
    // Returns array of rows that failed to download
    return failedDownloads
}


// Starts the program, this needs to be in a function so it can run async
const start = async () => {
    // Dynamicly finds the file and the delimiter
    const fileName = await findFile()
    const delimiter = await findDelimiter(fileName)

    if(!fileName)  
        return

    if(!delimiter)  
        return

    fs.createReadStream("../input/" + fileName)
    .pipe(csvParser({
        separator: delimiter
    }))
    .on("data", (result) => {
        // Extract the Data from the csv file
        data.push(result);
    })
    .on("end", async () => {
        // Tries to download all the pdf files through the primary source
        const firstPromises = await multiDownload(data, "Pdf_URL")
    
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
                const finalResults = formatResults(endResSuccededDownloads, endResFailedDownloads)
    
                writeCSV(finalResults)
            })
    
        })
    })
}

start()