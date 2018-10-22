const fs = require('fs');
const path = require('path');

const parsers = {
  iometer: require('./parsers/iometer'),
  passmark: require('./parsers/passmark'),
  specviewperf: require('./parsers/specviewperf'),
  specwpc: require('./parsers/specwpc'),
};

const testInputFile = '\\iometer-auto-norest-rdfc\\p330-tower-auto-pass1\\rnd-read-1GB\\iometer-rnd-read-1GB.csv';
const testInputDirSingle = '\\iometer-auto-norest-rdfc\\p330-tower-auto-pass1\\rnd-read-1GB\\';
const testInputDirMany = '\\iometer-auto-norest-rdfc\\p330-tower-auto-pass1\\';

const rootLogDir = '/Users/bbothwell5/Documents/Code/wsts-parser/scanner/sample/logs/';
const inputFile = path.resolve(rootLogDir + testInputDirMany);

try {
  fs.accessSync(inputFile, fs.constants.R_OK);
} catch (err) {
  // Unable to access file. Goodbye.
  // **TODO: Cleanup
  return console.error(err);
}

if (fs.lstatSync(inputFile).isDirectory()) {
  // Input is a directory. Check if single result or many results.
  // **TODO: Cleanup
  const inputDirList = fs.readdirSync(inputFile);
  if (inputDirList.length === 0) return console.error('ERROR - Input is an empty directory.', inputFile);

  let isMany = false;
  let resultDirs = [];
  let resultFile = [];
  for (let i = 0; i < inputDirList.length; i++) {
    const f = inputDirList[i];
    const tf = path.join(inputFile, f);
    if (fs.statSync(tf).isDirectory()) {
      isMany = true;
      resultDirs.push(tf);
    }
    if (f.match(/^(?!inst)iometer.*\.csv$/)) resultFile.push(tf);
  }
  if (! isMany && resultFile.length === 1) {
      // Input is a directory with a single result file - treat as single result and send directly to parser
      parsers['iometer'](resultFile[0]).then((result) => { console.log(result) }, (error) => { console.log(error) });
  }
  if (isMany) {
    // Input is multiple results
    resultDirs.forEach((d) => {
      const subDirList = fs.readdirSync(d);
      const subResultFile = [];
      for (let i = 0; i < subDirList.length; i++) {
        if (subDirList[i].match(/^(?!inst)iometer.*\.csv$/)) subResultFile.push(path.join(d, subDirList[i]));
      }
      if (subResultFile.length === 1) {
        parsers['iometer'](subResultFile[0]).then((result) => { console.log(`Results For ${d}`); console.log(result) }, (error) => { console.log(error) });
      }
    });
  }
} else {
  // Input is a file. Send directly to parser.
  // **TODO: Cleanup (determine/verify file type, etc.)
  parsers['iometer'](inputFile).then((result) => { console.log(result) }, (error) => { console.log(error) });
}


// *** Tests
// const iometerLogFile = 'C:\\Users\\bbothwell5\\Downloads\\Working\\iometer-auto-norest-rdfc\\p330-tower-auto-pass1\\rnd-read-1GB\\iometer-rnd-read-1GB.csv';
// parsers['iometer'](iometerLogFile).then((result) => { console.log(result) }, (error) => { console.log(error) });

// const passmarkLogFile = 'Z:\\Benchmark Data\\In Progress Benchmark Data\\Competitive Analysis\\TWR_P330_E-2146G_2x16GB_P4000\\P330_E2146G_2x16GB_256GB-P981_P4000_PM9.txt';
// parsers['passmark'](passmarkLogFile).then((result) => { console.log(result) }, (error) => { console.log(error) });

// const specviewperfLogFile = 'Z:\\Benchmark Data\\In Progress Benchmark Data\\Competitive Analysis\\TWR_P330_E-2146G_2x16GB_P4000\\SPECviewperf\\results_20181001T094205\\SPECviewperf_results.json';
// parsers['specviewperf'](specviewperfLogFile).then((result) => { console.log(result) }, (error) => { console.log(error) });

// const specwpcLogFile = 'Z:\\Benchmark Data\\In Progress Benchmark Data\\Competitive Analysis\\TWR_P330_E-2146G_2x16GB_P4000\\SPECwpc\\results_20180928T1827_r1\\resultHTML.html';
// parsers['specwpc'](specwpcLogFile).then((result) => { console.log(result) }, (error) => { console.log(error) });
