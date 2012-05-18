var fs = require('fs');
var args = require('optimist').usage('Usage: $0 --title [TITLE]').alias('t', 'title').describe('t',
		'The title of a work in the English WikiSource wiki.').demand([ 't' ]).argv;
var importer = require('../js/import/wikisource.js')(args);

var title = args.title;

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

/**
 * Called when a text has been read in and parsed
 */
var textProcessingCompleted = function(text, typography) {
	var fileName = title.toLowerCase() + ".json";
	fs.writeFile(fileName, (JSON.stringify({
		text : [ {
			text : text,
			sequence : 0
		} ],
		typography : typography,
		semantics : createDummyAnnotations(text, 500, 50),
		structure : []
	}, null, " ")), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("Written " + fileName);
		}
	});
};

importer.import(textProcessingCompleted, title);
