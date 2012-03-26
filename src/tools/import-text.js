// Import the named file, processing it and producing an appropriate JSON description of it
if (process.argv.length < 3) {
	console.log('Must specify a filename to import : ' + process.argv[1]
			+ ' FILENAME');
	process.exit(1);
}

var fs = require('fs');
var filename = process.argv[2];
var currentPosition = 0;

var string = [];
var typography = [];

var processString = function(line) {
	string.push(line.replace("\"", "\\\"", "gim"));
	typography.push({
		start : currentPosition,
		end : currentPosition + line.length,
		css : (line.substring(0, 7) == "CHAPTER") ? "chapter" : "paragraph"
	});
	// console.log(line.replace("\"", "\\\"", "gim"));
	currentPosition += line.length;
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
	fs.writeFile(filename + ".json", (JSON.stringify({
		text : string.join(""),
		offset : 0,
		typography : typography,
		semantics : []
	})), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("Written " + filename + ".json");
		}
	});

});