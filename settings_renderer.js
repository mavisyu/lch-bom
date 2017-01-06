const ipc = require('electron').ipcRenderer
var Datastore = require('nedb')
var fs = require("fs");
var mv = require('mv');

var setting = fs.readFileSync('conf/settings');
var default_path = setting.toString();
document.getElementById('library-path').value = setting;
const dbFileName = "/lch.db";
const selectDirBtn = document.getElementById('select-directory')


selectDirBtn.addEventListener('click', function (event) {
  ipc.send('setting-library-path')
})

ipc.on('selected-directory', function (event, path) {
  document.getElementById('library-path').value = `${path}`
})

const saveBtn = document.getElementById('save')

saveBtn.addEventListener('click', function (event) {
  let path = document.getElementById('library-path').value;
  fs.writeFile('conf/settings', path, function (err) {
    if (err) return console.log(err);
  });

  var origin_db_file = default_path + dbFileName;
  var exists = fs.existsSync(origin_db_file);
  var new_db_file = path + dbFileName;

  if (default_path !== path) {
    console.log('path not the same');
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

  ipc.send('back2index');
})