const ipc = require('electron').ipcRenderer
const Datastore = require('nedb')
const fs = require("fs");
const mv = require('mv');

// Constant variables
const setting = fs.readFileSync(`${__dirname}/../../conf/settings`);
const dbFileName = "/lch.db";
const selectDirBtn = document.getElementById('select-directory')
const saveBtn = document.getElementById('save')

// default settings
var default_path = setting.toString();
document.getElementById('library-path').value = setting;


selectDirBtn.addEventListener('click', function (event) {
  // send event to main.js
  ipc.send('setting-library-path')
})

saveBtn.addEventListener('click', function (event) {
  let path = document.getElementById('library-path').value;
  fs.writeFile('conf/settings', path, function (err) {
    if (err) return console.log(err);
  });

  var origin_db_file = default_path + dbFileName;
  var exists = fs.existsSync(origin_db_file);
  var new_db_file = path + dbFileName;

  // Create a DB file if DB doesn't exit,
  // otherwise move the DB file to new path.
  if (default_path !== path) {
    if (exists) {
      mv(origin_db_file, new_db_file, function(err) {
        console.log("error", err);
      });
      default_path = path;
    }
    else {
      db = new Datastore({ filename: new_db_file, autoload: true });
    }
  }

  // Send event to main.js
  ipc.send('back2index');
})

// Receive event from main.js
ipc.on('selected-directory', function (event, path) {
  document.getElementById('library-path').value = `${path}`
})