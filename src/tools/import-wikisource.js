var http = require('http');
var fs = require('fs');

if (process.argv.length < 3) {
	console.log("Specify a wikisource-en title from which to import : " + process.argv[1] + " TITLE");
	process.exit(1);
}
var title = process.argv[2];

/**
 * Defines the in-line tags which we recognise and convert to typographical annotations.
 */
var inlineTags = [ {
	name : "italic",
	open : "''",
	close : "''",
	style : "i"
}, {
	name : "bold",
	open : "'''",
	close : "'''",
	style : "b"
}, {
	name : "block",
	open : "<blockquote>",
	close : "</blockquote>",
	style : "bq"
} ];

/**
 * Called when a text has been read in and parsed
 */
var textProcessingCompleted = function(text, typography) {
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

/* Holds the plain text parts as they're being assembled */
var textParts = [];
/* Holds typographical annotations as they're assembled */
var typography = [];
/* Holds the current index within the text, maintained by the pushText function */
var index = 0;
/* Tracks currently opened tags within a line */
var openTags = {};
/* Track open tags across lines as a stack */
var tagStack = [];

/**
 * Pops the latest tag off the tag stack, sets its end position to the current index and pushes it
 * to the typography array.
 */
var popAndClose = function() {
	var tag = tagStack.pop();
	tag.end = index;
	typography.push(tag);
};

/**
 * Push a tag style onto the tag stack.
 */
var pushTag = function(style) {
	tagStack.push({
		css : style,
		start : index
	});
};

/**
 * Push text onto the textParts array, incrementing the index appropriately.
 */
var pushText = function(s) {
	textParts.push(s);
	index += s.length;
};

/**
 * Returns the last css style on the tag stack, or null if the stack is empty.
 */
var lastTag = function() {
	if (tagStack.length == 0) {
		return null;
	} else {
		return tagStack[tagStack.length - 1].css;
	}
};

/**
 * Track the current list depth
 */
var listDepth = 0;

/**
 * Counts the number of occurances of the specified character at the start of the string s
 */
var countAtStart = function(s, char) {
	if (s.indexOf(char) == 0) {
		var i = 0;
		while (s.charAt(i) == char) {
			i++;
		}
		return i;
	} else {
		return 0;
	}
};

/**
 * Perform any pre and post processing of line styles etc for the input line, delegating to the
 * processWikiText function to handle inline annotations. This function is used to wrap lines in
 * appropriate tags for the entire line, such as paragraphs and indentations.
 */
var processString = function(s) {
	var initialIndex = index;
	var lineStyle = null;
	// Check for heading styles
	if (s.indexOf("=") == 0) {
		var i = countAtStart(s, "=");
		s = s.substring(i, s.length - i);
		lineStyle = [ "h1", "h2", "h3", "h4", "h5", "h6" ][i];
		processWikiText(s);
	} else if (s.indexOf("*") == 0) {
		var i = countAtStart(s, "*");
		// Check whether we're going into a list
		if (i > listDepth) {
			pushTag("ul");
		}
		if (i < listDepth) {
			popAndClose();
		}
		lineStyle = "li";
		processWikiText(s.substring(1));
	} else {
		lineStyle = "p";
		processWikiText(s);
	}
	if (lineStyle != null) {
		typography.push({
			start : initialIndex,
			end : index,
			css : lineStyle
		});
	}
};

/**
 * Parse a line of wikitext, removing inline tags and creating the appropriate annotations to
 * represent the textus equivalents according to the tag list.
 */
var processWikiText = function(s) {
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
		inlineTags.forEach(function(tag) {
			if (openTags[tag.name] != null) {
				/*
				 * There is a tag open with this tag name, check for closing tags. Because we allow <=
				 * a later closing tag in the tag list will trump an earlier one. This makes it
				 * important that the tag list is sorted by ascending length of closing tag
				 */
				var i = s.indexOf(tag.close);
				if (i >= 0 && i <= state.lowestIndex) {
					state.foundTagName = tag.name;
					state.openingTag = false;
					state.lowestIndex = i;
					state.tag = tag;
				}
			} else {
				var i = s.indexOf(tag.open);
				if (((i >= 0 && tag.lineStart == null) || i == 0)
				/* Found the tag */
				&& ((i < state.lowestIndex)
				/*
				 * The tag is earlier than any we've already found, if any (the lowestIndex property
				 * is set to be sufficiently high that that first tag found will always be earlier
				 * than it)
				 */
				|| (i == state.lowestIndex && state.tag != null && state.tag.open.length < tag.open.length)))
				/*
				 * Or the tag is at the same position and longer, ensures that e.g. "'''" is
				 * consumed rather than "''", coping with the brain dead wikitext syntax where the
				 * number of magic characters is significant.
				 */
				{
					state.foundTagName = tag.name;
					state.openingTag = true;
					state.lowestIndex = i;
					state.tag = tag;
				}
			}
		});
		/* Now have the lowest tag in the state model */
		if (state.foundTagName != null) {
			pushText(s.substring(0, state.lowestIndex));
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
			pushText(s);
			s = "";
		}
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
						/* Avoid processing lines consisting entirely of whitespace */
						processString(line);
					}
				});
				textProcessingCompleted(textParts.join(""), typography);
				textParts = [];
				typography = [];
				index = 0;
			}
		}
	});
});
