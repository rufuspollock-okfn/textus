/**
 * ElasticSearch based implementation of the data store.
 */

var textChunkSize = 1000;

var buildRangeQuery = function(textId, start, end) {
	return {
		"query" : {
			"bool" : {
				"must" : [ {
					"text" : {
						"textid" : textId
					}
				}, {
					"range" : {
						"start" : {
							"lt" : end
						}
					}
				}, {
					"range" : {
						"end" : {
							"gte" : start
						}
					}
				} ]
			}
		},
		"size" : 10000
	};
};

/**
 * Accepts blocks of input text ordered by sequence and emits an array of {offset, text} where the
 * text parts are split on spaces and are at most maxSize characters long.
 */
var createTextChunks = function(maxSize, data) {
	/* Sort by sequence, extract text parts and join together */
	var text = data.text.sort(function(a, b) {
		return a.sequence - b.sequence;
	}).map(function(struct) {
		return struct.text;
	}).join("");
	var result = [];
	var offset = 0;
	while (text != "") {
		var length = text.lastIndexOf(" ", maxSize);
		if (length == -1) {
			length = text.length;
		} else if (length == 0) {
			result.push({
				text : text,
				offset : offset
			});
			text = "";
		} else {
			result.push({
				text : text.substring(0, length),
				offset : offset
			});
			text = text.substring(length);
			offset += length;
		}

	}
	console.log("Chunked text - " + result.length + " parts.");
	return result;
};

/**
 * Accept a start and end offset and a set of text chunks which guarantee to cover the specified
 * range, and return {text:STRING, start:INT, end:INT} for that range.
 */
var joinTextChunksAndTrim = function(start, end, chunks) {
	if (chunks.length == 0) {
		return {
			text : "",
			start : 0,
			end : 0
		};
	}
	chunks.sort(function(a, b) {
		return a.start - b.start;
	});
	return {
		text : chunks.map(function(chunk) {
			return chunk.text;
		}).join("").substr(start - chunks[0].start, end - start),
		start : start,
		end : end
	};
};

module.exports = exports = function(args) {

	var elastical = require('elastical');
	var client = new elastical.Client();

	var indexArray = function(index, type, list, callback) {
		var item = list.shift();
		if (item) {
			client.index(index, type, item, function(err, res) {
				if (err) {
					console.log(err);
				} else {
					indexArray(index, type, list, callback);
				}
			});
		} else {
			callback();
		}
	};

	return {

		fetch : function() {
			client.search(buildRangeQuery("Text1", 0, 2000), function(err, results, res) {
				if (err) {
					console.log(err);
				} else {
					var chunks = results.hits.map(function(hit) {
						return hit._source;
					});
					var result = joinTextChunksAndTrim(10, 100, chunks);

					console.log(result);
					console.log(result.text.length);

				}
				// console.log(results);
			});
		},

		fetchText : function(textId, start, end, callback) {
			client.search(buildRangeQuery(textId, start, end), function(err, results, res) {
				if (err) {
					console.log(err);
				} else {
					var textChunks = [];
					var typography = [];
					var semantics = [];
					results.hits.forEach(function(hit) {
						if (hit._type == "text") {
							textChunks.push(hit._source);
						} else if (hit._type == "typography") {
							typography.push(hit._source);
						} else if (hit._type == "semantics") {
							semantics.push(hit._source);
						} else {
							console.log("Unknown result type!");
							console.log(hit);
						}
					});
					callback({
						textid : textId,
						text : joinTextChunksAndTrim(start, end, textChunks).text,
						typography : typography,
						semantics : semantics,
						start : start,
						end : end
					});
				}
			});
		},

		importData : function(textId, data) {

			var textChunks = createTextChunks(textChunkSize, data).map(function(chunk) {
				return {
					textid : textId,
					text : chunk.text,
					start : chunk.offset,
					end : chunk.offset + chunk.text.length
				};
			});

			indexArray("textus", "text", textChunks, function() {
				console.log("Imported text chunks.");
				indexArray("textus", "semantics", data.semantics.map(function(annotation) {
					annotation.textid = textId;
					return annotation;
				}), function() {
					console.log("Imported semantics.");
					indexArray("textus", "typography", data.typography.map(function(annotation) {
						annotation.textid = textId;
						return annotation;
					}), function() {
						console.log("Imported typography.");
					});
				});

			});

		}
	};

};
