const fs = require('fs');

const specwpc = (logFile) => {
  return new Promise((resolve, reject) => {
    // SPECwpc parser will return a promise with related configData and summaryData.

    const parseSpecWpcTxt = (inputFile) => {
      // Parser for SPECwpc log file
      // **TODO: add error handling
      return new Promise((resolve, reject) => {
        const parserConfigData = [];
        const parserSummaryData = [];

        const regexSummaryContent = /<div class="tabContent" id="tabContent_1">(.*?)<\/div>/s;
        const regexSummaryRow = /<tr><td>(.+?)<\/td><td>(.+?)<\/td><td>.*?<\/td><td>(.*?)<\/td><td>(.*?)<\/td><\/tr>/g;
        const regexSummaryCategory = /<h3>(.+)<\/h3>/g;

        const regexConfigContent = /<div class="tabContent" id="tabContent_9">(.*?)<\/div>/s;
        const regexConfigRow = /<tr><td>(.*?)<\/td><td>(.*?)<\/td><\/tr>/g;
        const regexConfigCategory = /<h[34]>(.+)<\/h[34]>/g;

        fs.readFile(logFile, 'utf8', (error, content) => {
          if (error) {
            reject({reason: 'Error reading log file.', error});
          } else {
            let resultArray = [];
            let newCategory1 = false;
            let newCategory2 = false;
            let currentCategory1 = null;
            let currentCategory2 = null;

            while ((resultArray = regexSummaryRow.exec(regexSummaryContent.exec(content)[1])) !== null) {
              const categoryCheck1 = regexSummaryCategory.exec(resultArray[1]);
              if (categoryCheck1) {
                currentCategory1 = categoryCheck1[1];
                parserSummaryData[currentCategory1] = [{'overall': resultArray[2].replace(/<b>|<\/b>/g,'')}];
                newCategory1 = true;
              } else { newCategory1 = false; }
              regexSummaryCategory.lastIndex = 0;
              const categoryCheck2 = regexSummaryCategory.exec(resultArray[3]);
              if (categoryCheck2) {
                currentCategory2 = categoryCheck2[1];
                parserSummaryData[currentCategory2] = [{'overall': resultArray[4].replace(/<b>|<\/b>/g, '')}];
                newCategory2 = true;
              } else { newCategory2 = false; }

              if (!newCategory1 && resultArray[1].match(/^\ ?$/) === null) parserSummaryData[currentCategory1][resultArray[1]] = resultArray[2];
              if (!newCategory2 && resultArray[3].match(/^\ ?$/) === null) parserSummaryData[currentCategory2][resultArray[3]] = resultArray[4];
            }

            resultArray = [];
            let newCategory = false;
            let currentCategory = null;

            while ((resultArray = regexConfigRow.exec(regexConfigContent.exec(content)[1])) !== null) {
              const categoryCheck = regexConfigCategory.exec(resultArray[1]);
              if (categoryCheck) {
                currentCategory = categoryCheck[1];
                parserConfigData[currentCategory] = [];
                newCategory = true;
              } else { newCategory = false; }

              if (!newCategory && resultArray[1].match(/^\ ?$/) === null) parserConfigData[currentCategory].push({ key: resultArray[1], value: resultArray[2] });
            }

            resolve({parserConfigData, parserSummaryData});
          }
        });
      });
    }

    // Verify provided log file is a SPECwpc text file
    // **TODO: complete file verification and split this into a separate function
    parseSpecWpcTxt(logFile).then((result) => {
      resolve({
        configData: result.parserConfigData,
        summaryData: result.parserSummaryData
      });
    }, (error) => {
      reject(error);
    });
  });
};

module.exports = specwpc;
