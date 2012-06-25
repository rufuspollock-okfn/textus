/**
 * ElasticSearch based implementation of the data store.
 */
module.exports = exports = function(conf) {

	/**
	 * Create a new ElasticSearch client using the Elastical API
	 */
	var client = function() {
		var elastical = require('elastical');
		var client = new elastical.Client(conf.es.host, {
			port : conf.es.port,
			protocol : conf.es.protocol,
			timeout : conf.es.timeout
		});
		client.del = client['delete'];
		return client;
	}();

	/**
	 * Create the 'textus' index if it doesn't already exist
	 */
	client.createIndex('textus');
	client.createIndex('textus-users');

	/**
	 * Defines the maximum size of text chunk stored in the datastore in characters.
	 */
	var textChunkSize = 1000;

	/**
	 * Query object to extract entities between the specified start and end points and associated
	 * with the given textId
	 */
	var buildRangeQuery = function(textId, start, end) {
		return {
			"query" : {
				"bool" : {
					"must" : [ {
						"text" : {
							"textId" : textId
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
	 * Accepts blocks of input text ordered by sequence and emits an array of {offset, text} where
	 * the text parts are split on spaces and are at most maxSize characters long.
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
	 * 
	 * @param start
	 *            the desired index of the first character in the returned result
	 * @param end
	 *            the desired index of the character one beyond the returned result's end
	 * @param chunks
	 *            a collection of objects of the form {text:string, start:int, end:int} which may be
	 *            unordered but must define a contiguous range of text (this is currently not
	 *            tested)
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

	/**
	 * Method to index each item in a collection, using recursion to index the items sequentially.
	 * 
	 * @param index
	 *            the ElasticSearch index into which objects will be inserted
	 * @param type
	 *            the type under which the objects are indexed
	 * @param list
	 *            a list of objects to index
	 * @param callback
	 *            function(err) called on completion of list indexing, passed the error if something
	 *            went wrong or null otherwise.
	 */
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

	/**
	 * Convenience method to index multiple collections using the indexArray function.
	 * 
	 * @param index
	 *            the ElasticSearch index
	 * @param lists
	 *            a list of {type, list} where the type property is the type passed to the
	 *            indexArray function and the list is the list of objects to index.
	 * @param function(err)
	 *            called on completion with the error (if a failure) or null if success.
	 */
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
		} else {
			callback(null);
		}
	};

	/**
	 * The datastore API
	 */
	var datastore = {

		/**
		 * Retrieve a user record by user ID, typically an email address
		 * 
		 * @param userId
		 *            the user ID to retrieve
		 * @param callback
		 *            a function(err, user) called with the user structure or an error if no such
		 *            user exists
		 */
		getUser : function(userId, callback) {
			client.get("textus-users", userId, {
				type : "user"
			}, function(err, user) {
				callback(err, user);
			});
		},

		/**
		 * Create a new user, passing in a description of the user to create and calling the
		 * specified callback on success or failure
		 * 
		 * @param user
		 *            a user structure, see
		 * @param callback
		 *            a function(error, user) called with the user object stored or an error if the
		 *            storage was unsuccessful.
		 */
		createUser : function(user, callback) {
			client.index("textus-users", "user", user, {
				id : user.id,
				refresh : true,
				create : true
			}, function(err, result) {
				if (err) {
					callback(err, null);
				} else {
					callback(null, user);
				}
			});
		},

		/**
		 * As with create, but will not fail if the user already exists
		 */
		createOrUpdateUser : function(user, callback) {
			client.index("textus-users", "user", user, {
				id : user.id,
				refresh : true,
				create : false
			}, function(err, result) {
				if (err) {
					callback(err, null);
				} else {
					callback(null, user);
				}
			});
		},

		/**
		 * Delete the specified user record
		 */
		deleteUser : function(userId, callback) {
			client.del("textus-users", "user", userId, function(err, result) {
				if (err) {
					callback(err, null);
				} else {
					callback(null, result);
				}
			});
		},

		/**
		 * Create and index a new semantic annotation
		 * 
		 * @param annotation
		 * @param callback
		 * @returns
		 */
		createSemanticAnnotation : function(annotation, callback) {
			client.index("textus", "semantics", annotation, {
				refresh : true
			}, function(err, response) {
				if (err) {
					console.log(err);
				} else {
					//
				}
				callback(err, response);
			});
		},

		/**
		 * Returns all text structure records in the database in the form { textId : STRING,
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
							textId : hit._id,
							structure : hit._source.structure
						};
					}));
				}
			});
		},

		/**
		 * Exposes an ElasticSearch endpoint which can be used to query for bibliographic
		 * information associated with texts held in this datastore. Modifies the query in-flight to
		 * add a filter to restrict results to BibJSON blocks with the textus.role set to 'text'.
		 */
		queryTexts : function(query, callback) {
			query.filter = {
				"type" : {
					"value" : "bibjson"
				}
			};
			client.search(query, function(err, results, res) {
				if (err) {
					callback(err, null);
				} else {
					callback(null, res);
				}
			});
		},

		/**
		 * Retrieves text along with the associated typographical and semantic annotations which
		 * overlap at least partially with the specified range.
		 * 
		 * @param textId
		 *            the textId of the text
		 * @param start
		 *            character offset within the text, this will be the first character in the
		 *            result
		 * @param end
		 *            character offset within the text, this will be the character one beyond the
		 *            end of the result, so the result is a string of end-start length
		 * @param callback
		 *            a callback function callback(err, data) called with the data from the
		 *            elasticsearch query massaged into the form { textId : STRING, text : STRING,
		 *            typography : [], semantics : [], start : INT, end : INT }, and the err value
		 *            set to any error (or null if no error) from the underlying elasticsearch
		 *            instance.
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
						'textId' : textId,
						'text' : joinTextChunksAndTrim(start, end, textChunks).text,
						'typography' : typography,
						'semantics' : semantics,
						'start' : start,
						'end' : end
					});
				}
				;
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
		 *            a function of type function(error, textId)
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
					console.log("Registered structure, textId set to " + textId);
					var dataToIndex = [ {
						type : "text",
						list : createTextChunks(textChunkSize, data).map(function(chunk) {
							return {
								textId : textId,
								text : chunk.text,
								start : chunk.offset,
								end : chunk.offset + chunk.text.length
							};
						})
					}, {
						type : "semantics",
						list : data.semantics.map(function(annotation) {
							annotation.textId = textId;
							return annotation;
						})
					}, {
						type : "typography",
						list : data.typography.map(function(annotation) {
							annotation.textId = textId;
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
		},

		/**
		 * Stash the supplied set of bibliographic references.
		 * 
		 * @param refs
		 *            a list of bibJSON objects to store
		 * @param callback
		 *            function(err) called with null for success, an error message otherwise.
		 */
		storeBibliographicReferences : function(refs, callback) {
			indexArray("textus", "bibjson", refs, function(err) {
				if (err) {
					console.log(err);
				}
				callback(err);
			});
		}
	};

	return datastore;

};
