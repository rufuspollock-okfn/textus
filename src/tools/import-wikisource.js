var http = require('http');
var fs = require('fs');
var wikiText = require('./wikitext.js');

if (process.argv.length < 3) {
	console.log("Specify a wikisource-en title from which to import : " + process.argv[1] + " TITLE");
	process.exit(1);
}
var title = process.argv[2];

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
		text : text,
		offset : 0,
		typography : typography,
		semantics : createDummyAnnotations(text, 500, 50)
	}, null, " ")), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("Written " + fileName);
		}
	});
};

http.get({
	host : "en.wikisource.org",
	port : 80,
	headers : {
		"User-Agent" : "textus-harvester, tom.oinn@okfn.org"
	},
	path : "/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=" + title
}, function(res) {
	// console.log(res);
	var pageData = "";
	res.setEncoding('utf8');
	res.on('data', function(chunk) {
		pageData += chunk;
	});
	res.on('end', function() {
		var o = JSON.parse(pageData);
		for ( var pageId in o.query.pages) {
			if (o.query.pages.hasOwnProperty(pageId)) {
				var result = wikiText.readWikiText(o.query.pages[pageId].revisions[0]["*"]);
				textProcessingCompleted(result.text, result.typography);
			}
		}
	});
});
