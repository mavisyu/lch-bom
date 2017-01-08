var BomExcelUtil = require('./app/util/bom_excel_util');
var BomTextUtil = require('./app/util/bom_text_util');
const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
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
    mainWindow.loadURL(`file://${__dirname}/app/index.html`)
  }
  else {
    mainWindow.loadURL(`file://${__dirname}/app/settings/settings.html`)
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

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

// Menu
let template = [
  {
    label: '檔案',
    submenu: [
      {
        label: '開啟料單文字檔',
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [ { name: "Text", extensions: ['txt'] }]
              },
              function (files) {
                if (files) {
                  var bomTextUtil = new BomTextUtil();
                  var file = files[0];

                  bomTextUtil.getData(file, function(data) {
                    mainWindow.webContents.send('grid-data-txt', data);
                  });
                }
              })
          }
        }
      },
      {
        label: '開啟 3D-Excel 檔',
        // role: 'redo'
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [ { name: "Excel", extensions: ['xls', 'xlsx'] }]
              },
              function (files) {
                if (files) {
                  var bomExcelUtil = new BomExcelUtil();
                  var file = files[0];
                  var dir = file.slice(0, file.lastIndexOf('/') + 1);
                  var level0 = bomExcelUtil.getTopLevel(file, [], '0');

                  const topLevelKeys = bomExcelUtil.getTopLevelKeys(level0);
                  var level1 = bomExcelUtil.getSubsequentLevel(dir, topLevelKeys, '1');
                  const level1Keys = bomExcelUtil.getSubLevelKeys(level1);
                  var level2 = bomExcelUtil.getSubsequentLevel(dir, level1Keys, '2');
                  mainWindow.webContents.send('grid-data', level0, level1, level2);
                }
              })
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: '儲存成文字檔',
      },
      {
        label: '儲存成 Excel 檔',
      }],
  },
  {
    label: '標準件',
    submenu: [
      {
        label: '標準件列印'
      },
      {
        label: '標準件清單'
      }
    ]
  },
  {
    label: '樹狀圖查詢',
    submenu: [
      {
        label: '料號查詢'
      },
      {
        label: '件號查詢'
      }
    ]
  },
  {
    label: '報表',
    submenu: [
      {
        label: '列印材料單'
      },
      {
        label: '列印分發紀錄表'
      },
      {
        label: '列印設計課清單表'
      }
    ]
  },
  {
    label: '設定',
    submenu: [
      {
        label: '標準件號資料庫'
      },
      {
        label: 'ERP 料號庫'
      },
      {
        label: '來源別資料庫'
      },
      { type: 'separator' },
      {
        label: '系統設定',
        click: function (item, focusedWindow) {
          mainWindow.loadURL(`file://${__dirname}/app/settings/settings.html`)
        }
      }
    ]
  }
]

function addUpdateMenuItems (items, position) {
  if (process.mas) return
  items.splice.apply(items, [position, 0])
}

if (process.platform === 'darwin') {
  const name = electron.app.getName()
  template.unshift({
    label: name,
    submenu: [{
      label: `About ${name}`,
      role: 'about'
    }, {
      type: 'separator'
    }, {
      label: 'Services',
      role: 'services',
      submenu: []
    }, {
      type: 'separator'
    }, {
      label: `Hide ${name}`,
      accelerator: 'Command+H',
      role: 'hide'
    }, {
      label: 'Hide Others',
      accelerator: 'Command+Alt+H',
      role: 'hideothers'
    }, {
      label: 'Show All',
      role: 'unhide'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: function () {
        app.quit()
      }
    }]
  })
}

if (process.platform === 'win32') {
  const helpMenu = template[template.length - 1].submenu
  addUpdateMenuItems(helpMenu, 0)
}

app.on('ready', function () {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})
// End menu

// Receive event from renderer.js
ipc.on('open-file-dialog', function (event) {
  dialog.showOpenDialog({
      properties: ['openFile']
    },
    function (files) {
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
  mainWindow.loadURL(`file://${__dirname}/app/index.html`)
});