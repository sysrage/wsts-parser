const fs = require('fs');
const path = require('path');
const CsvReadableStream = require('csv-reader');

const iometer = (logFile) => {
  return new Promise((resolve, reject) => {
    // Iometer parser will return a promise with related configData and summaryData.
    // If an AID64 log is in the same directory, that data will be appended.

    // **TODO: Show errors/warnings if Iometer and AIDA64 configs don't match.

    const parseIometerCsv = (inputFile) => {
      // Parser for Iometer log file
      // **TODO: add error handling
      return new Promise((resolve, reject) => {
        const parserConfigData = [];
        const parserSummaryData = [];

        let isResults = false;
        let isResultsData = false;
        let isVersion = false;
        let isTestType = false;
        let isStartTime = false;
        let isStartDone = false;
        let isEndTime = false;
        const resultHeader = [];
        const resultData = [];
        const inputStream = fs.createReadStream(inputFile, 'utf8');
        inputStream
        .pipe(CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
        .on('data', (row) => {
          if (isResultsData) {
            if (row[0] === '\'Time Stamp') {
              isResultsData = false;
            } else {
              if (row[0] === 'ALL') {
                row.map((h) => resultData.push(h));
              }
            }
          }
          if (isResults) {
            if (row[0].substr(0, 1) === '\'') row[0] = row[0].replace(/^\'/, '');
            row.map((h) => resultHeader.push(h));
            isResults = false;
            isResultsData = true;
          }
          if (row[0] === '\'Results') isResults = true;

          if (!isResults && !isResultsData) {
            if (isVersion) {
              parserConfigData.push({'Iometer Version': row[0]});
              isVersion = false;
            }
            if (row[0] === '\'Version') isVersion = true;

            if (isTestType) {
              parserConfigData.push({'Test Type': row[0]});
              isTestType = false;
            }
            if (row[0] === '\'Access specification name') isTestType = true;

            if (isStartTime) {
              parserConfigData.push({'Test Start Time': row[0]});
              isStartTime = false;
              isStartDone = true;
            }
            if (isEndTime) {
              parserConfigData.push({'Test End Time': row[0]});
              isEndTime = false;
            }
            if (row[0] === '\'Time Stamp' && !isStartDone) isStartTime = true;
            if (row[0] === '\'Time Stamp' && isStartDone) isEndTime = true;
          }
        })
        .on('end', () => {
          for (let i = 0; i < resultHeader.length; i++) {
            parserSummaryData.push({
              name: resultHeader[i],
              value: resultData[i]
            });
          }
          resolve({parserConfigData, parserSummaryData});
        });
      });
    }

    const parseAidaCsv = (inputFile) => {
      // Parser for AIDA64 log file
      // **TODO: add error handling
      return new Promise((resolve, reject) => {
        const parserConfigData = [];
        const parserSummaryData = [];

        let isAidaResults = false;
        let isAidaResultsData = false;
        let aidaResultHeader = [];
        let aidaResultData = [];
        const inputStream = fs.createReadStream(inputFile, 'utf8');
        inputStream
          .pipe(CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
          .on('data', (row) => {
            if (isAidaResultsData) {
              aidaResultData.push(row);
            }
            if (isAidaResults && row.length > 1) {
              row.map((h) => aidaResultHeader.push(h));
              isAidaResults = false;
              isAidaResultsData = true;
            }
            if (row[0] === 'Log Finished') isAidaResults = true;

            if (row[0] === 'Version') parserConfigData.push({'AIDA64 Version': row[1]});
            if (row[0] === 'CPU Type') parserConfigData.push({'AIDA64 CPU Type': row[1] + ' - ' + row[2]});
            if (row[0] === 'Motherboard Name') parserConfigData.push({'AIDA64 Motherboard Name': row[1]});
            if (row[0] === 'Video Adapter') parserConfigData.push({'AIDA64 Video Adapter': row[1]});
            if (row[0] === 'Log Started') parserConfigData.push({'AIDA64 Log Start Time': row[1]});
            if (row[0] === 'Log Finished') parserConfigData.push({'AIDA64 Log End Time': row[1]});
          })
          .on('end', () => {
            for (let i = 0; i < aidaResultData.length; i++) {
              parserSummaryData.push({
                name: 'AIDA64 ' + aidaResultData[i][0],
                value: {
                  minimum: aidaResultData[i][aidaResultHeader.indexOf('Minimum')],
                  maximum: aidaResultData[i][aidaResultHeader.indexOf('Maximum')],
                  average: aidaResultData[i][aidaResultHeader.indexOf('Average')],
                }
              });
            }
            resolve({parserConfigData, parserSummaryData});
          });
      });
    }

    const configData = [];
    const summaryData = [];
    const parserList = [];

    // Verify provided log file is an Iometer CSV
    // **TODO: complete file verification and split this into a separate function
    parserList.push(parseIometerCsv(logFile));

    var possibleAidaLogs = fs.readdirSync(path.dirname(logFile))
      .filter(fn => fn.endsWith('stat.csv'))
      .filter(fn => fn.includes('aida'));

    if (possibleAidaLogs.length === 1) {
      // Single matching AIDA log exists -- Verify log file is an AIDA64 CSV
      // **TODO: complete file verification and split this into a separate function
      parserList.push(parseAidaCsv(path.resolve(path.dirname(logFile), possibleAidaLogs[0])));
    } else if (possibleAidaLogs.length > 1) {
      // **TODO: clean this up
      console.log('Warning: Skipping AIDA parsing -- Too many AIDA logs in same directory:', possibleAidaLogs);
    }

    // Run parsers and combine results
    Promise.all(parserList).then((results) => {
      for (let i = 0; i < results.length; i++) {
        results[i].parserConfigData.map((d) => configData.push(d));
        results[i].parserSummaryData.map((d) => summaryData.push(d));
      }
      resolve({configData, summaryData});
    }, (errors) => {
      reject(errors);
    });
  });
};

module.exports = iometer;

const tempLogFile = 'C:\\Users\\bbothwell5\\Downloads\\Working\\iometer-auto-norest-rdfc\\p330-tower-auto-pass1\\rnd-read-1GB\\iometer-rnd-read-1GB.csv';
iometer(tempLogFile).then((result) => { console.log(result) }, (error) => { console.log(error) });
