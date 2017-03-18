const Datastore = require('nedb')
const fs = require("fs");
const readline = require('readline')
const mv = require('mv');

// Constant variables
const setting = fs.readFileSync('conf/settings');
const dbFileName = "/lch.db";
const saveBtn = document.getElementById('save')
const table = document.getElementById('table')

// default settings
var default_path = setting.toString();
let dbpath = `${default_path}/${dbFileName}`;
db = new Datastore({ filename: `${dbpath}`, autoload: true });

saveBtn.addEventListener('click', function (event) {
  let standardCase = document.getElementById('standard-case').value;
  var standardCaseDoc = { type: 'standard_case', name: `${standardCase}`}
  db.insert(standardCaseDoc, function(err, newDocs) {
    console.log("err doc", JSON.stringify(err));
    console.log("standard case", JSON.stringify(newDocs));
  });

  readData();
})

var readData = function() {
  var new_tbody = document.createElement('tbody');
  table.replaceChild(new_tbody, table.tBodies[0]);
  db.find({type: 'standard_case'}, function (err, docs) {
    docs.forEach(function(data) {
      let row = table.insertRow(table.rows.length);
      let cell = row.insertCell(0);
      cell.innerHTML = data.name;
    })
  });
}

readData();