
const specviewperf = (logFile) => {
  return new Promise((resolve, reject) => {
    // SPECviewperf parser will return a promise with related configData and summaryData.

    // Verify provided log file is a SPECviewperf JSON file
    // **TODO: complete file verification and split this into a separate function

    const logFileData = require(logFile);
    const parserSummaryData = [];

    for (let key in logFileData.Scores) {
      parserSummaryData.push({
        name: logFileData.Scores[key].Name,
        composite: logFileData.Scores[key].Composite,
      });
    }

    resolve({configData: logFileData.Configuration, summaryData: parserSummaryData});
  });
};

module.exports = specviewperf;

const tempLogFile = 'Z:\\Benchmark Data\\In Progress Benchmark Data\\Competitive Analysis\\TWR_P330_E-2146G_2x16GB_P4000\\SPECviewperf\\results_20181001T094205\\SPECviewperf_results.json';
specviewperf(tempLogFile).then((result) => { console.log(result) }, (error) => { console.log(error) });
