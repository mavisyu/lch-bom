const fs = require('fs')
const readline = require('readline')

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

var BomTextlUtil = function() {
  var self = this;

  self.getData = getData;
}

module.exports = BomTextlUtil;