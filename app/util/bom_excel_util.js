XLSX = require('xlsx');
var _ = require('lodash');

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

var BomExcelUtil = function() {
  var self = this;

  self.getTopLevel = getTopLevel;

  self.getSubsequentLevel = getSubsequentLevel;

  self.getTopLevelKeys = getTopLevelKeys;

  self.getSubLevelKeys = getSubLevelKeys;
}

module.exports = BomExcelUtil;