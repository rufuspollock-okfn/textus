/**
 * Naive implementation of the data store, pulls test data from a static file on startup and serves
 * information entire from memory.
 */

var fs = require('fs');
var dummyData = JSON.parse(fs.readFileSync(__dirname + "/test-data.json"));
console.log("Loaded test data.");

var overlapsRange = function(startA, endA, startB, endB) {
	return (endB > startA) && (startB < endA);
};

var clamp = function(min, max, value) {
	return Math.max(Math.min(max, value), min);
};

/**
 * Retrieve a block of text and annotations.
 */
exports.fetchText = function(textId, textStart, textEnd) {
	var start = clamp(0, dummyData.text.length, textStart);
	var end = clamp(0, dummyData.text.length, textEnd);
	var includeAnnotation = function(annotation) {
		return overlapsRange(start, end, annotation.start, annotation.end);
	};
	return {
		start : start,
		end : end,
		text : dummyData.text.substring(start, end),
		typography : dummyData.typography.filter(includeAnnotation),
		semantics : dummyData.semantics.filter(includeAnnotation)
	};
};

/**
 * Retrieve the structure of the text, structure is retrieved as a list of structure node
 * definitions.
 */
exports.fetchStructure = function(textId) {
	return [];
};