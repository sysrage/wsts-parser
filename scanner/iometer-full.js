const fs = require('fs');
const path = require('path');
const xl = require('excel4node');

const parsers = {
  iometer: require('./parsers/iometer'),
  // passmark: require('./parsers/passmark'),
  // specviewperf: require('./parsers/specviewperf'),
  // specwpc: require('./parsers/specwpc'),
};

const testInputFile = '\\iometer-auto-norest-rdfc\\p330-tower-auto-pass1\\rnd-read-1GB\\iometer-rnd-read-1GB.csv';
const testInputDirSingle = '\\iometer-auto-norest-rdfc\\p330-tower-auto-pass1\\rnd-read-1GB\\';
const testInputDirMany = 'iometer-auto-10m_rest-iom/hp-z2-g4-auto-pass4';

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
      resultDirs.push({ name: f, dir: tf });
    }
    if (f.match(/^(?!inst)iometer.*\.csv$/)) resultFile.push(tf);
  }
  if (! isMany && resultFile.length === 1) {
      // Input is a directory with a single result file - treat as single result and send directly to parser
      parsers['iometer'](resultFile[0]).then((result) => { console.log(result) }, (error) => { console.log(error) });
  }
  if (isMany) {
    // Input is multiple results
    const parseList = [];
    resultDirs.forEach((d) => {
      const subDirList = fs.readdirSync(d.dir);
      const subResultFile = [];
      for (let i = 0; i < subDirList.length; i++) {
        if (subDirList[i].match(/^(?!inst)iometer.*\.csv$/)) subResultFile.push(path.join(d.dir, subDirList[i]));
      }
      if (subResultFile.length === 1) parseList.push({
        name: d.name,
        logDir: d.dir,
        logFile: subResultFile[0],
        promise: parsers['iometer'](subResultFile[0]),
      });
    });

    const resultPromises = [];
    parseList.forEach((p) => resultPromises.push(p.promise));
    Promise.all(resultPromises).then((results) => {
      let parseResults = {};
      results.forEach((result, index) => {
        parseResults[parseList[index].name] = {
          name: parseList[index].name,
          logDir: parseList[index].logDir,
          logFile: parseList[index].logFile,
          result: result,
        };
      });

      // resolve(parseResults);

      // Temp parsing/output for active work items
      // **TODO: move worksheet generation to a separate module
      const wb = new xl.Workbook();
      const ws = wb.addWorksheet(testInputDirMany.substring(testInputDirMany.search('/') + 1, testInputDirMany.length));

      // Worksheet cell styles
      // Percent: numberFormat: '#.00%; -#.00%; -'
      const speedStyle = wb.createStyle({
        font: {
          color: '#000000',
          size: 11,
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center',
        },
        numberFormat: '####; -####; -',
        border: {
          left: {style: 'thin', color: '#000000'},
          right: {style: 'thin', color: '#000000'},
          top: {style: 'thin', color: '#000000'},
          bottom: {style: 'thin', color: '#000000'},
        },
      });

      const tempStyle = wb.createStyle({
        font: {
          color: '#000000',
          size: 11,
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center',
        },
        numberFormat: '####; -####; -',
        border: {
          left: {style: 'thin', color: '#000000'},
          right: {style: 'thin', color: '#000000'},
          top: {style: 'thin', color: '#000000'},
          bottom: {style: 'thin', color: '#000000'},
        },
      });

      const testHeaderStyle = wb.createStyle({
        font: {
          color: '#0000FF',
          size: 11,
          bold: true,
        },
        alignment: { horizontal: 'center' },
        border: {
          left: {style: 'thin', color: '#000000'},
          right: {style: 'thin', color: '#000000'},
          top: {style: 'thin', color: '#000000'},
          bottom: {style: 'thin', color: '#000000'},
        },
      });

      const topHeaderStyle = wb.createStyle({
        font: {
          color: '#000000',
          size: 11,
          bold: true,
        },
        alignment: { horizontal: 'center' },
        border: {
          left: {style: 'thin', color: '#000000'},
          right: {style: 'thin', color: '#000000'},
          top: {style: 'thin', color: '#000000'},
          bottom: {style: 'thin', color: '#000000'},
        },
      });

      const sideHeaderStyle = wb.createStyle({
        font: {
          color: '#000000',
          size: 11,
          bold: true,
        },
        alignment: {
          wrapText: true,
          horizontal: 'center',
        },
        border: {
          left: {style: 'thin', color: '#000000'},
          right: {style: 'thin', color: '#000000'},
          top: {style: 'thin', color: '#000000'},
          bottom: {style: 'thin', color: '#000000'},
        },
      });

      // Add headers to worksheet
      ws.cell(3, 1)
      .string(['100% Sequential Read\n', '(QD = 32, T = 1)'])
      .style(sideHeaderStyle);

      ws.cell(4, 1)
      .string(['100% Sequential Write\n', '(QD = 32, T = 1)'])
      .style(sideHeaderStyle);

      ws.cell(5, 1)
      .string(['100% Random Read\n', '(QD = 32, T = 8)'])
      .style(sideHeaderStyle);

      ws.cell(6, 1)
      .string(['100% Random Write\n', '(QD = 32, T = 8)'])
      .style(sideHeaderStyle);

      ws.row(3).setHeight(30);
      ws.row(4).setHeight(30);
      ws.row(5).setHeight(30);
      ws.row(6).setHeight(30);
      ws.column(1).setWidth(20);
      ws.column(3).setWidth(6);
      ws.column(5).setWidth(6);

      // Add results to worksheet
      for (key in parseResults) {
        const log = parseResults[key];

        ws.cell(2, 2)
          .string('1GB')
          .style(topHeaderStyle);
        ws.cell(2, 3)
          .string('⁰C')
          .style(topHeaderStyle);

        ws.cell(2, 4)
          .string('32GB')
          .style(topHeaderStyle);
        ws.cell(2, 5)
          .string('⁰C')
          .style(topHeaderStyle);

        let testType = undefined;
        let testVer = undefined;
        let testSize = key.match(/(1|32)[Gg][Bb]$/)[1] || '0';
        const col = testSize === '1' ? 2 : 4;
        let startTime = undefined;
        let endTime = undefined;
        console.log('');
        console.log('File Size: ' + testSize);
        for (let i = 0; i < log.result.configData.length; i++) {
          if (log.result.configData[i]['Iometer Version']) {
            testVer = log.result.configData[i]['Iometer Version'];
            ws.cell(2, 1)
              .string('Iometer ' + testVer)
              .style(testHeaderStyle);
            console.log('Iometer Version: ' + testVer);
            }
          if (log.result.configData[i]['Test Type']) {
            testType = log.result.configData[i]['Test Type'];
            console.log('Test Type: ' + testType);
          }
          if (log.result.configData[i]['Test Start Time']) {
            startTime = log.result.configData[i]['Test Start Time'];
            console.log('Test Start Time: ' + startTime);
          }
          if (log.result.configData[i]['Test End Time']) {
            endTime = log.result.configData[i]['Test End Time'];
            console.log('Test End Time: ' + endTime);
          }
        }

        for (let i = 0; i < log.result.summaryData.length; i++) {
          if (testType === 's.r' && log.result.summaryData[i].name === 'Read MBps (Decimal)') {
            ws.cell(3, col)
            .number(log.result.summaryData[i].value)
            .style(speedStyle);
            console.log('Read MBps (Dec.): ' + log.result.summaryData[i].value);
          }
          if (testType === 's.w' && log.result.summaryData[i].name === 'Write MBps (Decimal)') {
            ws.cell(4, col)
            .number(log.result.summaryData[i].value)
            .style(speedStyle);
            console.log('Write MBps (Dec.): ' + log.result.summaryData[i].value);
          }
          if (testType === 'r.r' && log.result.summaryData[i].name === 'Read IOps') {
            ws.cell(5, col)
            .number(log.result.summaryData[i].value)
            .style(speedStyle);
            console.log('Read IOps: ' + log.result.summaryData[i].value);
          }
          if (testType === 'r.w' && log.result.summaryData[i].name === 'Write IOps') {
            ws.cell(6, col)
            .number(log.result.summaryData[i].value)
            .style(speedStyle);
            console.log('Write IOps: ' + log.result.summaryData[i].value);
          }
          if (log.result.summaryData[i].name === 'AIDA64 HDD1') {
            const row = testType === 's.r' ? 3
              : testType === 's.w' ? 4
              : testType === 'r.r' ? 5
              : 6
            ws.cell(row, col + 1)
            .number(log.result.summaryData[i].value.maximum)
            .style(tempStyle);
            console.log('HDD1 Max Temp: ' + log.result.summaryData[i].value.maximum);
          }
        }
      }
      wb.write(path.resolve(rootLogDir, '../output/', testInputDirMany.substring(testInputDirMany.search('/') + 1, testInputDirMany.length) + '.xlsx'));


    }, (error) => { console.log(error) });
  }
} else {
  // Input is a file. Send directly to parser.
  // **TODO: Cleanup (determine/verify file type, etc.)
  parsers['iometer'](inputFile).then((result) => { console.log(result) }, (error) => { console.log(error) });
}
