XLSX = require('xlsx');
var _ = require('lodash');
var moment = require('moment-timezone');

// read excel
var sheet2arr = function(sheet){
  var result = [];
  var row;
  var rowNum;
  var colNum;
  for(rowNum = sheet['!range'].s.r; rowNum <= sheet['!range'].e.r; rowNum++){
    row = [];
    for(colNum=sheet['!range'].s.c; colNum<=sheet['!range'].e.c; colNum++){
      var nextCell = sheet[
        XLSX.utils.encode_cell({r: rowNum, c: colNum})
        ];
      if( typeof nextCell === 'undefined' ){
        row.push(void 0);
      }
      else row.push(nextCell.w);
    }
    result.push(row);
  }
  return result;
};


var opts = {};
var filesystem = require("fs");

var readToArray = function(file, ids, level, path) {
  var filenameArr = file.split('-');
  var metrix = [];
  if ((level === '0') ||
    ((ids.indexOf(filenameArr[0]) > -1)
    && (filenameArr[1].split('.')[0] == level))
  ) {

    file = (path) ? path + file : file;
    var workbook = XLSX.readFile(file, opts);
    var result = sheet2arr(workbook.Sheets[workbook.SheetNames[0]]);
    if (level === '1') {
      metrix = metrix.concat(result[0]);
    }
    else {
      metrix = metrix.concat(result.slice(1, result.length -1));
    }
  }

  return metrix;
};

var getTopLevel = function(path, ids, level) {
  return readToArray(path, ids, level);
};

var getSubsequentLevel = function(path, ids, level) {

  var map = {};
  filesystem.readdirSync(path).forEach(function(file) {
    var filePart = file.split('-');
    var itemNum = filePart[0];

    if (_.includes(ids, filePart[0]) &&
      (filePart[1] !== undefined && filePart[1].split('.')[0] === level)
    ) {
      map[itemNum] = readToArray(file, ids, level, path);
    }
  });

  return map;
};

var getTopLevelKeys = function(topLevel) {
  return topLevel.filter(function(item) { return (item[1] !== undefined); })
                 .map(function(item) { return item[1] });
}

var getSubLevelKeys = function(subLevel) {
  const keys = [];
  for (var key in subLevel) {
    if (subLevel[key].length === 0) continue;
    keys.push(key);
  }
  return keys;
}
// end read excel

// write excel
function datenum(v, date1904) {
  if(date1904) v+=1462;
  var epoch = Date.parse(v);
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data, opts) {
  var ws = {};
  var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
  for(var R = 0; R != data.length; ++R) {
    for(var C = 0; C != data[R].length; ++C) {
      if(range.s.r > R) range.s.r = R;
      if(range.s.c > C) range.s.c = C;
      if(range.e.r < R) range.e.r = R;
      if(range.e.c < C) range.e.c = C;
      var cell = {v: data[R][C] };
      if(cell.v == null) continue;
      var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

      if(typeof cell.v === 'number') cell.t = 'n';
      else if(typeof cell.v === 'boolean') cell.t = 'b';
      else if(cell.v instanceof Date) {
        cell.t = 'n'; cell.z = XLSX.SSF._table[14];
        cell.v = datenum(cell.v);
      }
      else cell.t = 's';

      ws[cell_ref] = cell;
    }
  }
  if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
  return ws;
}

var exportBom = function(path, exportData) {
  /* original data */
  var data = [
    [ "階層",
      "件號",
      "品名",
      "規格",
      "材質",
      "數量",
      "單重",
      "圖號",
      "來源別",
      "材料編號",
      "圖格" ]
  ]

  data = _.concat(data, exportData);
  var ws_name = "BOM";

  function Workbook() {
    if(!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
  }

  var wb = new Workbook(), ws = sheet_from_array_of_arrays(data);

  /* add worksheet to workbook */
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;

  const datetime = moment().tz("Asia/Taipei").format('YYYY-MM-DD_hhmm');
  /* write file */
  XLSX.writeFile(wb, `${path}/exported_bom_${datetime}.xlsx`);
}
// end write excel


var BomExcelUtil = function() {
  var self = this;

  self.getTopLevel = getTopLevel;

  self.getSubsequentLevel = getSubsequentLevel;

  self.getTopLevelKeys = getTopLevelKeys;

  self.getSubLevelKeys = getSubLevelKeys;

  self.exportBom = exportBom;
}

module.exports = BomExcelUtil;