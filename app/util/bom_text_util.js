const fs = require('fs')
const readline = require('readline')
var _ = require('lodash');
var moment = require('moment-timezone');

var getData = function(file, callback) {
  var lineReader = readline.createInterface({
    input: fs.createReadStream(file)
  });

  var i = 0;
  var result = { data: []};
  var rl = lineReader.on('line', function (line) {
    if (i === 0) {
      var fields = line.trim().split(',');
      result['fields'] = fields;
      i++;
    }
    else if (i === 1) {
      i++;
    }
    else {
      result.data.push(line.split(','));
    }
  })

  rl.on('close', function() {
    callback(result);
  });
}

var exportBom = function(path, headerRow, exportData) {
  /* original data */
  var data = [
    headerRow,
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
  const datetime = moment().tz("Asia/Taipei").format('YYYY-MM-DD_hhmm');
  var file = fs.createWriteStream(`${path}/exported_txt_${datetime}.txt`);
  file.on('error', function(err) { console.error("export to txt failure", err) });
  data.forEach(function(v) { file.write(_.join(v, ',') + '\n'); });
  file.end();

}

var replaceDoubleQuote = function (data) {
  return _.replace(data, new RegExp('"',"g"), '&quot;')
}

var BomTextlUtil = function() {
  var self = this;

  self.getData = getData;

  self.exportBom = exportBom;

  self.replaceDoubleQuote = replaceDoubleQuote;
}

module.exports = BomTextlUtil;