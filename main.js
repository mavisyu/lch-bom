var BomExcelUtil = require('./bom_excel_util');
const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
const fs = require("fs");
const data = fs.readFileSync('conf/settings');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  if (data.toString()) {
    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`)
  }
  else {
    mainWindow.loadURL(`file://${__dirname}/settings.html`)
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// Receive event from renderer.js
ipc.on('open-file-dialog', function (event) {
  dialog.showOpenDialog({
    properties: ['openFile']
  }, function (files) {
    console.log("files", JSON.stringify(files));
if (files) {
      var bomExcelUtil = new BomExcelUtil();
      var file = files[0];
      var dir = file.slice(0, file.lastIndexOf('/') + 1);
      var level0 = bomExcelUtil.getTopLevel(file, [], '0');

      const topLevelKeys = bomExcelUtil.getTopLevelKeys(level0);
      var level1 = bomExcelUtil.getSubsequentLevel(dir, topLevelKeys, '1');
      const level1Keys = bomExcelUtil.getSubLevelKeys(level1);
      var level2 = bomExcelUtil.getSubsequentLevel(dir, level1Keys, '2');

      // Send event to renderer.js
      event.sender.send('grid-data', level0, level1, level2);
    }
  })
})

// Receive events from settings_renderer.js
ipc.on('setting-library-path', function (event) {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }, function (files) {
    if (files) event.sender.send('selected-directory', files)
  })
});

ipc.on('back2index', function (event) {
  mainWindow.loadURL(`file://${__dirname}/index.html`)
});