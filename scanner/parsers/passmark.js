const fs = require('fs');

const passmark = (logFile) => {
  return new Promise((resolve, reject) => {
    // Passmark parser will return a promise with related configData and summaryData.

    const parsePassmarkTxt = (inputFile) => {
      // Parser for Passmark log file
      // **TODO: add error handling
      return new Promise((resolve, reject) => {
        const parserConfigData = [];
        const parserSummaryData = [];

        const regexConfigData = /(.*?[^\ ]):\ (.+?)\r\n/g;
        const regexSummaryData = /(.+?)\ :\ (.+?)\r\n/g;

        fs.readFile(inputFile, 'utf8', (error, content) => {
          if (error) {
            reject({reason: 'Error reading log file.', error});
          } else {
            let resultArray = [];
            while ((resultArray = regexSummaryData.exec(content)) !== null) {
              parserSummaryData.push({ key: resultArray[1], value: resultArray[2] });
            }

            resultArray = [];
            while ((resultArray = regexConfigData.exec(content)) !== null) {
              parserConfigData.push({ key: resultArray[1], value: resultArray[2] });
            }

            resolve({parserConfigData, parserSummaryData});
          }
        });
      });
    }

    // Verify provided log file is a Passmark text file
    // **TODO: complete file verification and split this into a separate function
    parsePassmarkTxt(logFile).then((result) => {
      resolve({
        configData: result.parserConfigData,
        summaryData: result.parserSummaryData
      });
    }, (error) => {
      reject(error);
    });
  });
};

module.exports = passmark;

const tempLogFile = 'Z:\\Benchmark Data\\In Progress Benchmark Data\\Competitive Analysis\\TWR_P330_E-2146G_2x16GB_P4000\\P330_E2146G_2x16GB_256GB-P981_P4000_PM9.txt';
passmark(tempLogFile).then((result) => { console.log(result) }, (error) => { console.log(error) });
