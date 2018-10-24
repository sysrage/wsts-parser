const path = require('path');
const parsers = {
  iometer: require('./iometer'),
  passmark: require('./passmark'),
  specviewperf: require('./specviewperf'),
  specwpc: require('./specwpc'),
};

const rootLogDir = '/Users/bbothwell5/Documents/Code/wsts-parser/scanner/sample/logs/';

// *** Tests
const iometerLogFile = path.resolve(rootLogDir + '\\iometer-auto-norest-rdfc\\p330-tower-auto-pass1\\rnd-read-1GB\\iometer-rnd-read-1GB.csv');
parsers['iometer'](iometerLogFile).then((result) => { console.log(result) }, (error) => { console.log(error) });

const passmarkLogFile = path.resolve(rootLogDir + '\\Competitive Analysis\\TWR_P330_E-2146G_2x16GB_P4000\\P330_E2146G_2x16GB_256GB-P981_P4000_PM9.txt');
parsers['passmark'](passmarkLogFile).then((result) => { console.log(result) }, (error) => { console.log(error) });

const specviewperfLogFile = path.resolve(rootLogDir + '\\Competitive Analysis\\TWR_P330_E-2146G_2x16GB_P4000\\SPECviewperf\\results_20181001T094205\\SPECviewperf_results.json');
parsers['specviewperf'](specviewperfLogFile).then((result) => { console.log(result) }, (error) => { console.log(error) });

const specwpcLogFile = path.resolve(rootLogDir + '\\Competitive Analysis\\TWR_P330_E-2146G_2x16GB_P4000\\SPECwpc\\results_20180928T1827_r1\\resultHTML.html');
parsers['specwpc'](specwpcLogFile).then((result) => { console.log(result) }, (error) => { console.log(error) });

// SPECwpc -- financial services only - dump raw numbers
// const specwpcLogFile = 'Z:\\Benchmark Data\\In Progress Benchmark Data\\Competitive Analysis\\TWR_HP Z2_E-2146G_2x16GB_P4000\\SPECwpc\\fs-round2\\results_20181023T0934_r3\\resultHTML.html';
// parsers['specwpc'](specwpcLogFile).then((result) => {
//   for (key in result.summaryData['Financial Services']) {
//     if (key === '0') {
//       console.log(result.summaryData['Financial Services'][key].overall);
//       // console.log('Total: ' + result.summaryData['Financial Services'][key].overall);
//     } else {
//       console.log(result.summaryData['Financial Services'][key]);
//       // console.log(key + ': ' + result.summaryData['Financial Services'][key]);
//     }
//   }
// }, (error) => { console.log(error) });
