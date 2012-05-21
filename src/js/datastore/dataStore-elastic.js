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
					callback(err);
				} else {
					indexArray(index, type, list, callback);
				}
			});
		} else {
			console.log("Indexed data with type " + type);
			callback(null);
		}
	};

	var indexArrays = function(index, lists, callback) {
		var wrap = lists.shift();
		if (wrap) {
			var type = wrap.type;
			var list = wrap.list;
			indexArray(index, type, list, function(err) {
				if (err) {
					err.message = "Error while indexing " + type;
					callback(err);
				} else {
					indexArrays(index, lists, callback);
				}
			});
		}
	};

	return {

		createSemanticAnnotation : function(annotation, callback) {
			client.index("textus", "semantics", annotation, function(err, response) {
				if (err) {
					console.log(err);
				} else {
					//
				}
				callback(err, response);
			});
		},

		/**
		 * Returns all text structure records in the database in the form { textid : STRING,
		 * structure : [] } via the callback(error, data).
		 */
		getTextStructures : function(callback) {
			var query = {
				"query" : {
					"match_all" : {}
				},
				"filter" : {
					"type" : {
						"value" : "structure"
					}
				},
				"size" : 10000
			};
			client.search(query, function(err, results, res) {
				if (err) {
					callback(err, null);
				} else {
					callback(null, results.hits.map(function(hit) {
						return {
							textid : hit._id,
							structure : hit._source.structure
						};
					}));
				}
			});
		},

		/**
		 * Retrieves text along with the associated typographical and semantic annotations which
		 * overlap at least partially with the specified range.
		 * 
		 * @param textId
		 *            the TextID of the text
		 * @param start
		 *            character offset within the text, this will be the first character in the
		 *            result
		 * @param end
		 *            character offset within the text, this will be the character one beyond the
		 *            end of the result, so the result is a string of end-start length
		 * @param callback
		 *            a callback function callback(err, data) called with the data from the
		 *            elasticsearch query massaged into the form { textid : STRING, text : STRING,
		 *            typography : [], semantics : [], start : INT, end : INT }, and the err value
		 *            set to any error (or null if no error) from the underlying elasticsearch
		 *            instance.
		 * @returns
		 */
		fetchText : function(textId, start, end, callback) {
			client.search(buildRangeQuery(textId, start, end), function(err, results, res) {
				if (err) {
					callback(err, null);
				} else {
					var textChunks = [];
					var typography = [];
					var semantics = [];
					var error = null;
					results.hits.forEach(function(hit) {
						if (hit._type == "text") {
							textChunks.push(hit._source);
						} else if (hit._type == "typography") {
							hit._source.id = hit._id;
							typography.push(hit._source);
						} else if (hit._type == "semantics") {
							hit._source.id = hit._id;
							semantics.push(hit._source);
						} else {
							error = "Unknown result type! '" + hit._type + "'.";
							console.log(hit);
						}
					});
					callback(error, {
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

		/**
		 * Index the given data, calling the callback function on completion with either an error
		 * message or the text ID of the stored data.
		 * 
		 * @param data {
		 *            text : [ { text : STRING, sequence : INT } ... ], semantics : [], typography :
		 *            [], structure : [] }
		 * @param callback
		 *            a function of type function(error, textID)
		 * @returns immediately, asynchronous function.
		 */
		importData : function(data, callback) {
			var indexName = "textus";
			client.index(indexName, "structure", {
				time : Date.now(),
				structure : data.structure
			}, function(err, res) {
				if (!err) {
					var textId = res._id;
					console.log("Registered structure, textID set to " + textId);
					var dataToIndex = [ {
						type : "text",
						list : createTextChunks(textChunkSize, data).map(function(chunk) {
							return {
								textid : textId,
								text : chunk.text,
								start : chunk.offset,
								end : chunk.offset + chunk.text.length
							};
						})
					}, {
						type : "semantics",
						list : data.semantics.map(function(annotation) {
							annotation.textid = textId;
							return annotation;
						})
					}, {
						type : "typography",
						list : data.typography.map(function(annotation) {
							annotation.textid = textId;
							return annotation;
						})
					} ];
					indexArrays(indexName, dataToIndex, function(err) {
						callback(err, textId);
					});
				} else {
					callback(err, null);
				}
			});
		}
	};

};
