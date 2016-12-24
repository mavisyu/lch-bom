var _ = require('lodash');
var Grid = require('editable-grid'),
datepicker = require('date-selector'),
$ = require('jquery');
const ipc = require('electron').ipcRenderer

datepicker();

const selectDirBtn = document.getElementById('select-directory')

selectDirBtn.addEventListener('click', function (event) {
  ipc.send('open-file-dialog')
})

ipc.on('grid-data',function(event, level0, level1, level2) {
  var data = [];
  level0.forEach(function(row) {
    const caseNum = _.split(row[6], '-');
    const obj = { a: '1',
                  b: caseNum[1] + '-' + caseNum[0],
                  c: row[2],
                  d: (row[1] && level1[row[1]]) ? level1[row[1]][5] : '',
                  e: row[3],
                  f: row[4],
                  g: row[5],
                  h: row[6],
                  i: 'M',
                  j: '',
                  k: ''
                };
    data.push(obj);

    if (row[1] && level2[row[1]]) {
      level2[row[1]].forEach(function(row) {
        const obj = { a: '2',
                      b: '',
                      c: row[2],
                      d: row[1],
                      e: row[3],
                      f: row[4],
                      g: row[5],
                      h: '',
                      i: 'M',
                      j: '',
                      k: ''
                    };
        data.push(obj);
      });
    }

  });

  (function (el) {
    var grid = new Grid({
      el: el,
      columns: [
        { id: 'a', title: '階層' },
        { id: 'b', title: '件號' },
        { id: 'c', title: '品名' },
        { id: 'd', title: '規格' },
        { id: 'e', title: '材質' },
        { id: 'f', title: '數量' },
        { id: 'g', title: '單重' },
        { id: 'h', title: '圖號' }, // If comment has dash(-) display comment, else display empty
        { id: 'i', title: '來源別' }, // Default as M if ERP exist show the ERP instead
        { id: 'j', title: '材料編號' }, // Find ERP by Case Number to find corresponding value, other wise empty showed
        { id: 'k', title: '圖格' }
      ],
      data: data
    });
    grid.render();
  }) ($("#grid"));
})
