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
	 * Get the index name from the configuration
	 */
	var textusIndex = conf.es.index;

	/**
	 * Defines the maximum size of text chunk stored in the datastore in characters.
	 */
	var textChunkSize = 1000;

	/**
	 * Build a new query object to retrieve entities with a matching textId, start index less than
	 * 'start' and end index greater than or equal to 'end'. Optionally restrict results to a
	 * particular type, omit to include all results.
	 */
	function buildRangeQuery(textId, start, end, type) {
		var result = {
			"query" : {
				"bool" : {
					"must" : [ {
						"term" : {
							"textId" : textId.toLowerCase()
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
			"size" : 1000000,
			"index" : textusIndex
		};
		if (type) {
			result.filter = {
				"type" : {
					"value" : type
				}
			};
		}
		return result;
	}

	/**
	 * Build a new query object to retrieve entities of the specified matching all of the supplied
	 * terms. If the terms argument is omitted this matches all entities of that type. The terms
	 * argument is an object where keys are the keys in the "term" argument within a boolean 'must'
	 * and values are their required values.
	 */
	function buildTermQuery(type, terms) {
		var result = {
			"filter" : {
				"type" : {
					"value" : type
				}
			},
			"size" : 10000,
			"index" : textusIndex
		};
		if (terms) {
			result.query = {
				"bool" : {
					"must" : []
				}
			};
			for ( var termName in terms) {
				if (terms.hasOwnProperty(termName)) {
					var term = {};
					term[termName] = terms[termName].toLowerCase();
					result.query.bool.must.push({
						"term" : term
					});
				}
			}
		} else {
			result.query = {
				"match_all" : {}
			};
		}
		return result;
	}

	/**
	 * Accepts blocks of input text ordered by sequence and emits an array of {offset, text} where
	 * the text parts are split on spaces and are at most maxSize characters long.
	 */
	function createTextChunks(maxSize, data) {
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
		return result;
	}

	/**
	 * Accept a start and end offset and a set of text chunks which guarantee to cover the specified
	 * range, and return {text:STRING, start:INT, end:INT} for that range.
	 * 
	 * @param start
	 *            the desired index of the first character in the returned result, null to specify
	 *            no trim
	 * @param end
	 *            the desired index of the character one beyond the returned result's end, null to
	 *            specify no trim
	 * @param chunks
	 *            a collection of objects of the form {text:string, start:int, end:int} which may be
	 *            unordered but must define a contiguous range of text (this is currently not
	 *            tested)
	 */
	function joinTextChunksAndTrim(start, end, chunks) {
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
		if (start != null && end != null) {
			return {
				text : chunks.map(function(chunk) {
					return chunk.text;
				}).join("").substr(start - chunks[0].start, end - start),
				start : start,
				end : end
			};
		} else {
			return {
				text : chunks.map(function(chunk) {
					return chunk.text;
				}).join("")
			};
		}
	}

	/**
	 * Method to index each item in a collection, using a bulk indexing operation.
	 * 
	 * @param type
	 *            the type under which the objects are indexed
	 * @param list
	 *            a list of objects to index
	 * @param callback
	 *            function(err) called on completion of list indexing, passed the error if something
	 *            went wrong or null otherwise.
	 */
	function indexArray(type, list, callback) {
		if (list.length > 0) {
			client.bulk(list.map(function(item) {
				return {
					index : {
						"index" : textusIndex,
						"type" : type,
						"data" : item
					}
				};
			}), function(err, res) {
				if (err) {
					console.log("Indexing failed : " + err);
				}
				callback(err);
			});
		} else {
			callback(null);
		}
	}

	/**
	 * Convenience method to index multiple collections using the indexArray function.
	 * 
	 * @param lists
	 *            a list of {type, list} where the type property is the type passed to the
	 *            indexArray function and the list is the list of objects to index.
	 * @param function(err)
	 *            called on completion with the error (if a failure) or null if success.
	 */
	function indexArrays(lists, callback) {
		var wrap = lists.shift();
		if (wrap) {
			var type = wrap.type;
			var list = wrap.list;
			indexArray(type, list, function(err) {
				if (err) {
					err.message = "Error while indexing " + type;
					callback(err);
				} else {
					indexArrays(lists, callback);
				}
			});
		} else {
			callback(null);
		}
	}

	/**
	 * The datastore API
	 */
	var datastore = {

		/**
		 * Initialise the datastore
		 * 
		 * @param callback
		 *            called with any error, or null if the initialisation succeeded.
		 */
		init : function(callback) {
			client.createIndex(textusIndex, function(err, index, data) {
				if (!err || err
						&& (err + "" === "Error: IndexAlreadyExistsException[[" + textusIndex + "] Already exists]")) {
					callback(null);
				} else {
					callback(err);
				}
			});
		},

		/**
		 * Delete the entire index and re-create it, purging all contents. Callback will be called
		 * with an error message, or null if the operation succeeded.
		 */
		clearIndex : function(callback) {
			client.deleteIndex(textusIndex, function(err, data) {
				if (!err) {
					client.createIndex(textusIndex, function(err, index, data) {
						callback(err);
					});
				} else {
					callback(err);
				}
			});
		},

		/**
		 * Bulk delete objects of the specified type by ID.
		 */
		deleteByIds : function(type, ids, callback) {
			// console.log("Removing by ID from '" + type + "'", JSON.stringify(ids));
			/* Check for empty ID list - this causes the bulk operation to fail */
			if (ids.length == 0) {
				callback(null);
				return;
			}
			client.bulk(ids.map(function(item) {
				return {
					"delete" : {
						"index" : textusIndex,
						"type" : type,
						"id" : item
					}
				};
			}), function(err, res) {
				callback(err);
			});
		},

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
			client.get(textusIndex, userId, {
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
			client.index(textusIndex, "user", user, {
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
			client.index(textusIndex, "user", user, {
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
			client.del(textusIndex, "user", userId, function(err, result) {
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
		 *            the annotation to store
		 * @param callback
		 *            called with (err, response) where err is the error or null and response is the
		 *            response from elasticsearch
		 */
		createSemanticAnnotation : function(annotation, callback) {
			client.index(textusIndex, "semantics", annotation, {
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
		 * Returns summary information for all uploads in the form { title: STRING, owners :
		 * [string], date:INT } via the callback(error, data).
		 */
		getTextStructureSummaries : function(callback) {
			client.search(buildTermQuery('metadata'), function(err, results, res) {
				if (err) {
					callback(err, null);
				} else {
					var result = {};
					results.hits.forEach(function(hit) {
						result[hit._id] = {
							title : hit._source.title,
							owners : hit._source.owners,
							date : hit._source.date
						};
					});
					callback(null, result);
				}
			});
		},

		/**
		 * Update the metadata document for a given TextID. The metadata defines both the set of
		 * markers used for bibliographic search and indexing and the ownership of this upload.
		 * 
		 * @param textId
		 *            the textID, actually acts as the ID of the metadata document as this is how
		 *            the internals work.
		 * @param newMetadata
		 *            the new metadata document
		 * @param callback
		 *            called with (err, result), where one argument will be null depending on
		 *            success / failure of the call.
		 */
		updateTextMetadata : function(textId, newMetadata, callback) {
			newMetadata.date = Date.now;
			client.index(textusIndex, "metadata", newMetadata, {
				id : textId,
				refresh : true,
				create : false
			}, function(err, result) {
				if (err) {
					callback(err, null);
				} else {
					datastore.getTextMetadata(textId, callback);
				}
			});
		},

		/**
		 * Replace the set of bibliographic references used when searching for text entry points
		 * from the 'all texts' page. This deletes the existing references, if any, and indexes the
		 * new ones, refreshing the index.
		 * 
		 * @param textId
		 *            the text ID for which references should be stored.
		 * @param newRefs
		 *            an array of BibJSON objects, these will have the necessary textus fields added
		 *            if they aren't already present.
		 * @param callback
		 *            called with (err, result) where err is the error or null if everything was
		 *            fine, and result is the set of references which were stored or null if the
		 *            method failed.
		 */
		replaceReferencesForText : function(textId, newRefs, callback) {
			newRefs.forEach(function(ref) {
				if (!ref.textus) {
					ref.textus = {};
				}
				ref.textus.textId = textId;
				ref.textus.role = 'text';
			});
			/* Find the existing references, if any, and delete them */
			datastore.getBibliographicReferences(textId, function(err, result) {
				if (err) {
					callback(err, null);
				} else {
					// console.log("Retrieved existing refs : ", JSON.stringify(result));
					datastore.deleteByIds('bibjson', result.map(function(ref) {
						return ref.textus.id;
					}), function(err) {
						if (err) {
							/* Failed during the delete part! */
							callback(err, null);
						} else {
							datastore.storeBibliographicReferences(newRefs, function(err) {
								if (err) {
									callback(err, null);
								} else {
									datastore.getBibliographicReferences(textId, function(err, result) {
										// console.log("Store now contains : ",
										// JSON.stringify(result));
										callback(err, result);
									});
								}
							});
						}
					});
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
			// console.log("storeBibliographicReferences", JSON.stringify(refs, null, 2));
			indexArray("bibjson", refs, function(err) {
				if (err) {
					console.log(err);
				}
				client.refresh(textusIndex, function(err) {
					callback(err);
				});

			});
		},

		/**
		 * Retrieve all the references with textus.role === 'text' and the specified textus.textId
		 * 
		 * @param textId
		 * @param callback
		 *            called with (err, result) where err is null if success and result is an array
		 *            of BibJSON objects matching the search.
		 */
		getBibliographicReferences : function(textId, callback) {
			var query = buildTermQuery("bibjson", {
				"textus.textId" : textId,
				"textus.role" : "text"
			});
			// console.log("getBibliographicReferences for '" + textId + "'", JSON.stringify(query,
			// null, 2));
			client.search(query, function(err, results, res) {
				if (err) {
					callback(err, null);
				} else {
					// console.log(JSON.stringify(results, null, 2));
					var result = results.hits.map(function(hit) {
						var item = hit._source;
						item.textus.id = hit._id;
						return item;
					});
					callback(null, result);
				}
			});
		},

		/**
		 * Retrieve the metadata document containing the structure markers and ownership information
		 * for a single uploaded text.
		 * 
		 * @param textId
		 *            the text for which metadata should be retrieved
		 * @param callback
		 *            called with (err, result) where err is null or the error and result is the
		 *            metadata document or null if the call failed.
		 */
		getTextMetadata : function(textId, callback) {
			client.get(textusIndex, textId, function(err, doc, res) {
				if (err) {
					callback(err, null);
				} else {
					callback(null, doc);
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
			query.index = textusIndex;
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
			var query = buildRangeQuery(textId, start, end);
			client.search(query, function(err, results, res) {
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

		fetchCompleteText : function(textId, callback) {
			var query = {
				"query" : {
					"text" : {
						"textId" : textId
					},
				},
				"size" : 1000000,
				"index" : textusIndex
			};
			client.search(query, function(err, results, res) {
				if (err) {
					callback(err, null);
				} else {
					var textChunks = [];
					var typography = [];
					results.hits.forEach(function(hit) {
						if (hit._type == "text") {
							textChunks.push(hit._source);
						} else if (hit._type == "typography") {
							hit._source.id = hit._id;
							typography.push(hit._source);
						}
					});
					callback(null, {
						'textId' : textId,
						'text' : joinTextChunksAndTrim(null, null, textChunks).text,
						'typography' : typography
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
		 *            []}
		 * @param callback
		 *            a function of type function(error, textId)
		 */
		importData : function(data, callback) {
			data.metadata.date = Date.now;
			client.index(textusIndex, "metadata", data.metadata, function(err, res) {
				if (!err) {
					var textId = res._id;
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
					indexArrays(dataToIndex, function(err) {
						client.refresh(textusIndex, function(err, res) {
							callback(err, textId);
						});
					});
				} else {
					callback(err, null);
				}
			});
		}

	};

	return datastore;

};
