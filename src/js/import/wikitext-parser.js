/**
 * Parse the given wikiText into text and typography parts
 */
exports.readWikiText = function(wikiText) {
	textParts = [];
	typography = [];
	index = 0;

	var linegroups = wikiText.split(/(?=(?:\r?\n){2,})|(?:\r?\n(?=[\*|\:|\#]))/);
	linegroups.forEach(function(linegroup) {
		var line = linegroup.split(/\r?\n/).join(" ").trim();
		if (line != "") {
			/* Avoid processing lines consisting entirely of whitespace */
			processString(line);
		} else {
			/* Close any open list tags */
			while (listDepth > 0) {
				popAndClose();
				listDepth--;
			}
		}
	});

	return {
		text : textParts.join(""),
		typography : typography
	};
};

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

var countClassAtStart = function(s, chars) {
	var count = 0;
	var done = false;
	while (!done) {
		done = true;
		chars.forEach(function(char) {
			if (s.charAt(count) == char) {
				done = false;
				count++;
			}
		});
	}
	return count;
};

/**
 * Perform any pre and post processing of line styles etc for the input line, delegating to the
 * processWikiText function to handle inline annotations. This function is used to wrap lines in
 * appropriate tags for the entire line, such as paragraphs and indentations.
 */
var processString = function(s) {
	// Check whether we need to close any lists or indentations
	if (s.indexOf("*") != 0 && s.indexOf("#") != 0) {
		while (listDepth > 0) {
			popAndClose();
			listDepth--;
		}
	}
	var initialIndex = index;
	var lineStyle = null;
	// Check for heading styles
	if (s.indexOf("=") == 0) {
		var i = countAtStart(s, "=");
		s = s.substring(i, s.length - i);
		lineStyle = [ "h1", "h2", "h3", "h4", "h5", "h6" ][i - 1];
		processWikiText(s);
	} else if (s.indexOf("*") == 0 || s.indexOf("#") == 0) {
		var i = countClassAtStart(s, [ "#", "*" ]);
		// Check whether we're going into a list
		if (i > listDepth) {
			if (s.charAt(i - 1) == "*") {
				pushTag("ul");
			} else {
				pushTag("ol");
			}
			listDepth = i;
		}
		while (i < listDepth) {
			listDepth--;
			popAndClose();
		}
		lineStyle = "li";
		processWikiText(s.substring(i));
	} else if (s.indexOf(":") == 0) {
		var i = countAtStart(s, ":");
		s = s.substring(i);
		lineStyle = [ "i1", "i2", "i3", "i4", "i5", "i6" ][i - 1];
		processWikiText(s);
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
	// Chop leading and trailing whitespace
	s = s.trim();
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
