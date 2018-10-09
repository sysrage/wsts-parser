const fs = require('fs');

const logFile = require('Z:\\Benchmark Data\\In Progress Benchmark Data\\Competitive Analysis\\TWR_P330_E-2146G_2x16GB_P4000\\SPECviewperf\\results_20181001T094205\\SPECviewperf_results.json');


const configData = logFile.Configuration;
const summaryData = [];

for (let key in logFile.Scores) {
  summaryData.push({
    name: logFile.Scores[key].Name,
    composite: logFile.Scores[key].Composite,
  });
}

console.log('CONFIG');
console.log(configData);
console.log('SUMMARY');
console.log(summaryData);
