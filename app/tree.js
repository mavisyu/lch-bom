const ipc = require('electron').ipcRenderer;
const _ = require('lodash');

let treeview = require('electron-tree-view');
ipc.on('tree-data',function(event, treeData) {


  const root = { name: '件號', children: []};
  let level1
  let level2

  _.forEach(treeData, function (row) {
    let title = `${row['b']} ${row['c']} ${row['d']}`
    if (row['a'] == 1) {
      level1 = {name: title, children: []}
      root.children.push(level1);
    }
    else if (row['a'] == 2) {
      level2 = {name: title, children: []}
      level1.children.push(level2)
    }
    else if (row['a'] == 3) {
      let node = {name: title, children: []}
      level2.children.push(node)
    }
  })

  treeview({
    root,
    container: document.getElementById('tree'),
    children: c => c.children,
    label: c => c.name
  });
})
