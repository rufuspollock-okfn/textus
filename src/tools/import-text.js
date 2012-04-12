// Import the named file, processing it and producing an appropriate JSON description of it
if (process.argv.length < 3) {
	console.log('Must specify a filename to import : ' + process.argv[1] + ' FILENAME');
	process.exit(1);
}

var fs = require('fs');
var filename = process.argv[2];
var currentPosition = 0;

var string = [];
var typography = [];

var processString = function(line) {
	string.push(line);
	typography.push({
		start : currentPosition,
		end : currentPosition + line.length,
		css : (line.substring(0, 7) == "CHAPTER") ? "chapter" : "paragraph"
	});
	currentPosition += line.length;
};

var createDummyAnnotations = function(string, count, spanlength) {
	annotations = [];
	for ( var i = 0; i < count; i++) {
		var startPos = Math.floor(Math.random() * (string.length - spanlength));
		var endPos = startPos + Math.floor(Math.random() * spanlength);
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

fs.readFile(filename, 'utf8', function(error, data) {
	if (error) {
		throw error;
	}
	linegroups = data.split(/(\r?\n){2,}/);
	linegroups.forEach(function(linegroup) {
		line = linegroup.split(/\r?\n/).join(" ");
		if (!line.match(/^\s+$/)) {
			processString(line);
		}
	});
	var text = string.join("");
	fs.writeFile(filename + ".json", (JSON.stringify({
		text : text,
		offset : 0,
		typography : typography,
		semantics : createDummyAnnotations(text, 2000, 100)
	}, null, "  ")), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("Written " + filename + ".json");
		}
	});

});