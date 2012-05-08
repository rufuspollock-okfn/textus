var fs = require('fs');
var wt = require('./wikitext.js');

var createDummyAnnotations = function(string, count, spanlength) {
	annotations = [];
	for ( var i = 0; i < count; i++) {
		var startPos = Math.floor(Math.random() * ((string.length - 1) - spanlength));
		var endPos = startPos + Math.floor(Math.random() * spanlength) + 1;
		var rCol = function() {
			return Math.floor(Math.random() * 256);
		};
		annotations.push({
			start : startPos,
			end : endPos,
			id : "annotation" + i,
			colour : "rgba(" + rCol() + "," + rCol() + "," + rCol() + ",0.2)"
		});
	}
	return annotations;
};

fs.readFile('wikitext.txt', function(err, data) {
	if (err) {
		console.error("Could not open file", err);
		process.exit(1);
	}
	var result = wt.readWikiText(data.toString());
	var fileName = "output.json";
	fs.writeFile(fileName, (JSON.stringify({
		text : result.text,
		offset : 0,
		typography : result.typography,
		semantics : createDummyAnnotations(result.text, 100, 10)
	}, null, " ")), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("Written " + fileName);
		}
	});
});