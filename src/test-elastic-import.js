var args = require('optimist').argv;
var ds = require('./js/datastore/dataStore-elastic.js')(args);
var fs = require('fs');
var dummyData = JSON.parse(fs.readFileSync(__dirname + "/tools/meno.json"));
console.log("Loaded test data.");
ds.importData("Text1", dummyData);
