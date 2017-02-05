const _ = require('lodash');
const Grid = require('editable-grid');
const datepicker = require('date-selector');
const $ = require('jquery');
const ipc = require('electron').ipcRenderer;

datepicker();

// Receive event from main.js
ipc.on('grid-data',function(event, level0, level1, level2) {
  var data = [];
  level0.forEach(function(row) {
    const hasDash = _.includes(row[6], '-');
    let caseNum = (row[1]) ? '-' + row[1] : '';
    let graphNum = (hasDash) ? row[6] : '';
    if (hasDash) {
      const arr = _.split(row[6], '-');
      caseNum = arr[1] + '-' + arr[0];
    }
    const obj = { a: '1',
                  b: caseNum,
                  c: row[2],
                  d: (row[1] && level1[row[1]]) ? level1[row[1]][5] : '',
                  e: row[3],
                  f: row[4],
                  g: row[5],
                  h: graphNum,
                  i: 'M',
                  j: '',
                  k: ''
                };
    data.push(obj);

    if (row[1] && level2[row[1]]) {
      level2[row[1]].forEach(function(record) {
        let recCaseNum = (record[1]) ? '-' + record[1] : '';
        if (hasDash && recCaseNum) {
          const arr = _.split(row[6], '-');
          recCaseNum = arr[1] + recCaseNum + '-' + arr[0];
        }
        const obj = { a: '2',
                      b: recCaseNum,
                      c: record[2],
                      d: record[1],
                      e: record[3],
                      f: record[4],
                      g: record[5],
                      h: graphNum,
                      i: 'M',
                      j: '',
                      k: ''
                    };
        data.push(obj);
      });
    }

  });

  (function (el) {
    var grid = newGrid(el, data);
    grid.render();
  }) ($("#grid"));
});

ipc.on('grid-data-txt',function(event, txtData) {
  document.getElementById('manufacture-num').value = txtData.fields[0];
  document.getElementById('upper-num').value = txtData.fields[1];
  document.getElementById('assemble-num').value = txtData.fields[2];
  document.getElementById('client-abbre').value = txtData.fields[3];
  document.getElementById('upper-name').value = txtData.fields[4];
  document.getElementById('assemble-name').value = txtData.fields[5];
  document.getElementById('machine-num').value = txtData.fields[6];
  var inCharge = document.getElementById('in-charge');
  setSelected(inCharge.children, txtData.fields[7]);

  document.getElementById('single-num').value = txtData.fields[8];
  document.getElementById('pic-num').value = txtData.fields[9];
  var picCell = document.getElementById('pic-cell');
  setSelected(picCell.children, txtData.fields[10]);

  var data = [];
  txtData.data.forEach(function (row) {
    const obj = {
      a: row[0],
      b: row[1],
      c: row[2],
      d: row[3],
      e: row[4],
      f: row[5],
      g: row[6],
      h: row[7],
      i: row[8],
      j: row[9],
      k: row[10]
    };
    data.push(obj);
  });

  (function (el) {
    var grid = newGrid(el, data);
    grid.render();
  }) ($("#grid"));
});

ipc.on('export-excel',function(event) {
  $("#grid").find(".editable-body-table").find('tr').each(function (i, v) {
    $(this).find('input').each(function (ii, vv) {
      console.log("input val", $(this).val());
    });
  })
});

var setSelected = function(options, value) {
  for (var i = 0; i < options.length; i++) {
    if (options[i].value === value) {
      options[i].selected = true;
      break;
    }
  }
}

var newGrid = function(el, data) {
  return new Grid({
    stateManager: {
      isEditable: function(rowId, colId) {
        return true;
      }
    },
    el: el,
    columns: [
      { id: 'a', title: '階層', width: '9.1%' },
      { id: 'b', title: '件號', width: '9.1%' },
      { id: 'c', title: '品名', width: '9.1%' },
      { id: 'd', title: '規格', width: '9.1%' },
      { id: 'e', title: '材質', width: '9.1%' },
      { id: 'f', title: '數量', width: '9.1%' },
      { id: 'g', title: '單重', width: '9.1%' },
      { id: 'h', title: '圖號', width: '9.1%' }, // If comment has dash(-) display comment, else display empty
      { id: 'i', title: '來源別', width: '9.1%' }, // Default as M if ERP exist show the ERP instead
      { id: 'j', title: '材料編號', width: '9.1%' }, // Find ERP by Case Number to find corresponding value, other wise empty showed
      { id: 'k', title: '圖格', width: '9.1%' }
    ],
    data: data
  });
}