// Import the named file, processing it and producing an appropriate JSON description of it
if (process.argv.length < 3) {
	console.log('Must specify a filename to import : ' + process.argv[1]
			+ ' FILENAME');
	process.exit(1);
}

var fs = require('fs');
var filename = process.argv[2];
var currentPosition = 0;

var processString = function(line) {
	//console.log(currentPosition + ": " + line);
	var quotes = line.match(/\W'([^']+)'\W/g);
	if (quotes) {
		//console.log(quotes.index);
		quotes.forEach(function(quote) {
			console.log(quote.index);
		});
	}
	
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
});