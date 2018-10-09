const fs = require('fs');

const logFile = 'Z:\\Benchmark Data\\In Progress Benchmark Data\\Competitive Analysis\\TWR_P330_E-2146G_2x16GB_P4000\\P330_E2146G_2x16GB_256GB-P981_P4000_PM9.txt';

const regexConfigData = /(.*?[^\ ]):\ (.+?)\r\n/g;
const regexSummaryData = /(.+?)\ :\ (.+?)\r\n/g;

const summaryData = [];
const configData = [];

fs.readFile(logFile, 'utf8', (error, content) => {
  if (error) {
    console.log('Error reading log file.', error);
  } else {
    let resultArray = [];
    while ((resultArray = regexSummaryData.exec(content)) !== null) {
      summaryData.push({ key: resultArray[1], value: resultArray[2] });
    }

    resultArray = [];
    while ((resultArray = regexConfigData.exec(content)) !== null) {
      configData.push({ key: resultArray[1], value: resultArray[2] });
    }

    console.log('CONFIG');
    console.log(configData);
    console.log('SUMMARY');
    console.log(summaryData);
  }
});
