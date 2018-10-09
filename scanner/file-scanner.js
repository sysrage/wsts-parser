const sqlite3 = require('sqlite3').verbose();
// const chokidar = require('chokidar');
const nsfw = require('nsfw');

// Config

const logFile = './file-scanner.log';
const dbFile = './scan.db';
const baseScanDir = 'sample/logs';
// const baseScanDir = 'Z:\\Benchmark\ Data\\In\ Progress\ Benchmark Data';


// Database Startup

// let db = new sqlite3.Database(dbFile, (err) => {
//   if (err) {
//       return console.error(err.message);
//   }

//   console.log(`Connected to SQLite database (${dbFile}).`);
// });

// Database Cleanup

// db.close((err) => {
//   if (err) {
//     return console.error(err.message);
//   }

//   console.log(`SQLite database has been closed (${dbFile}).`);
// });


// Watch log directory for changes
// ** watch for new dir - make a new 'collection' -- try to verify all files in dir are for the same 'host'
// ** collections will contain 'hosts'
// ** all logs/files will be associated to hosts -- web UI will make users confirm associations and/or manually assign
// ** all 'hosts' will be matched to a model -- separate model db with known models and available configs


// *************** NSFW ****************

var watcher2;
return nsfw(
  baseScanDir,
  function(events) {
    // handles other events
    console.log(events);
  },
  {
    debounceMS: 250,
    errorCallback(errors) {
      //handle errors
      console.log(`Watcher errors:`, errors);
    }
  })
  .then(function(watcher) {
    watcher2 = watcher;
    return watcher.start();
  })
  .then(function() {
    // we are now watching dir2 for events!
  })
  .then(function() {
    // To stop watching
    watcher2.stop();
  })

// *************** CHOKIDAR ****************
// Initialize watcher.
// var watcher = chokidar.watch(baseScanDir, {
//   ignored: /(^|[\/\\])\../,
//   persistent: true,
//   usePolling: true,
// });

// Add event listeners.
// console.log('Performing initial scan of log directory.');
// watcher
//   .on('add', path => {
//     console.log(`File ${path} has been added`);
//   })
//   .on('change', (path, stats) => {
//     console.log(`File ${path} has been changed`,stats);
//   })
//   .on('unlink', path => {
//     console.log(`File ${path} has been removed`);
//   })
//   .on('error', error => {
//     console.log(`Watcher error: ${error}`);
//   })
//   .on('ready', () => {
//     console.log('Initial scan of log directory complete. Monitoring for changes...');
//   });
