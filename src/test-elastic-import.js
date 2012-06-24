var args = require('optimist').argv;
var ds = require('./js/datastore/dataStore-elastic.js')(args);
var fs = require('fs');
var dummyData = JSON.parse(fs.readFileSync(__dirname + "/tools/meno.json"));
console.log("Loaded test data.");
 ds.importData(dummyData, function(err, textId) {
	if (err) {
		console.log("Import failed : " + err);
	} else {
		console.log("Import success : " + textId);
	}
});
ds.getTextStructures(function(err, data) {
	data.forEach(function(hit) {
		console.log("Text ID : " + hit.textId);
		console.log(hit.structure);
	});
});
