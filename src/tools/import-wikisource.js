var http = require('http');
var fs = require('fs');

if (process.argv.length < 3) {
	console.log("Specify a wikisource-en title from which to import : " + process.argv[1] + " TITLE");
	process.exit(1);
}
var title = process.argv[2];

/**
 * Defines the tags which we recognize and convert to typographical markup
 */
var tags = [ {
	name : "wikiTextEmphasis",
	open : "'''",
	close : "'''",
	style : "b"
} ];

/**
 * Returns an appropriate enclosing style for a complete line, or null if there's no such style
 * applicable.
 */
var enclosingStyle = function(s) {
	return "p";
};

/**
 * Called when a text has been read in and parsed
 */
var textRead = function(text, typography) {
	var fileName = title.toLowerCase() + ".json";
	fs.writeFile(fileName, (JSON.stringify({
		text : text,
		offset : 0,
		typography : typography,
		semantics : []
	}, null, " ")), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("Written " + fileName);
		}
	});
};

var textParts = [];
var typography = [];
var index = 0;

var openTags = {};

var processString = function(s) {
	var initialIndex = index;
	var lineStyle = enclosingStyle(s);
	while (s.length > 0) {
		/*
		 * Find the first opening or closing tag for each tag type, only using the closing tags to
		 * search if there's an open tag with that name
		 */
		var state = {
			lowestIndex : s.length,
			foundTagName : null,
			openingTag : false,
			tag : null
		};
		tags.forEach(function(tag) {
			if (openTags[tag.name] != null) {
				/* There is a tag open with this tag name, check for closing tags */
				var i = s.indexOf(tag.close);
				if (i >= 0 && i <= state.lowestIndex) {
					state.foundTagName = tag.name;
					state.openingTag = false;
					state.lowestIndex = i;
					state.tag = tag;
				}
			} else {
				var i = s.indexOf(tag.open);
				if (i >= 0 && i < state.lowestIndex) {
					state.foundTagName = tag.name;
					state.openingTag = true;
					state.lowestIndex = i;
					state.tag = tag;
				}
			}
		});
		/* Now have the lowest tag in the state model */
		if (state.foundTagName != null) {
			textParts.push(s.substring(0, state.lowestIndex));
			index += state.lowestIndex;
			if (state.openingTag) {
				/* Open a new tag, store the current index and the tag itself */
				openTags[state.foundTagName] = {
					name : state.foundTagName,
					index : index
				};
				s = s.substring(state.tag.open.length + state.lowestIndex);
			} else {
				/* Close an existing tag, writing the metadata object */
				var tagPair = openTags[state.foundTagName];
				typography.push({
					start : tagPair.index,
					end : index,
					css : state.tag.style
				});
				openTags[state.foundTagName] = null;
				s = s.substring(state.tag.close.length + state.lowestIndex);
			}
		} else {
			textParts.push(s);
			index += s.length;
			s = "";
		}
	}
	if (lineStyle != null) {
		typography.push({
			start : initialIndex,
			end : index,
			css : lineStyle
		});
	}
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
				var wikiText = o.query.pages[pageId].revisions[0]["*"];
				linegroups = wikiText.split(/(\r?\n){2,}/);
				linegroups.forEach(function(linegroup) {
					line = linegroup.split(/\r?\n/).join(" ");
					if (!line.match(/^\s+$/)) {
						processString(line);
					}
				});
				textRead(textParts.join(""), typography);
				textParts = [];
				typography = [];
				index = 0;
			}
		}
	});
});
