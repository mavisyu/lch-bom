const ipc = require('electron').ipcRenderer
var fs = require("fs");
var data = fs.readFileSync('conf/settings');
console.log("data", data.toString());
document.getElementById('library-path').value = data;

const selectDirBtn = document.getElementById('select-directory')

selectDirBtn.addEventListener('click', function (event) {
  ipc.send('setting-library-path')
})

ipc.on('selected-directory', function (event, path) {
  document.getElementById('library-path').value = `${path}`
})

const saveBtn = document.getElementById('save')

saveBtn.addEventListener('click', function (event) {
  console.log("event", event);
  let path = document.getElementById('library-path').value;
  fs.writeFile('conf/settings', path, function (err) {
    if (err) return console.log(err);
  });
})