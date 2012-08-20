// Textus configuration
var conf = require('./js/textusConfiguration.js').conf();
// Backend datastore, requires configuration
var datastore = require('./js/datastore/dataStore-elastic.js')(conf);
// Login and user helper, requires datastore
var login = require('./js/login.js')(datastore, conf);
// Annotation painter, requires login helper
var painter = require('./js/annotationPainter.js')(login);
// FileSystem API
var fs = require('fs');
// File parsers
var parsers = require('./js/import/parsers.js');
// URL handling support
var url = require('url');
// Marker parsing
var markers = require('./public/js/markers.js');

/**
 * Configure the HTTP server with the body parser used to handle file uploads.
 */
var app = function() {
	var express = require('express');
	var _app = express.createServer();
	_app.use(express.bodyParser());
	_app.use(express.cookieParser());
	_app.use(express.session({
		secret : "my secret..."
	}));
	_app.enable("jsonp callback");
	_app.configure(function() {
		_app.use(express.bodyParser());
		_app.use(_app.router);
		// Declare local routes to serve public content
		_app.use(express.static(__dirname + "/public"));
		_app.use(express.errorHandler({
			dumpExceptions : true,
			showStack : true
		}));
	});
	return _app;
}();

/**
 * GET requests for text and annotation data
 */
app.get("/api/text/:textId/:start/:end", function(req, res) {
	datastore.fetchText(req.params.textId, parseInt(req.params.start), parseInt(req.params.end), function(err, data) {
		var user = login.getCurrentUserId(req);
		data.semantics = data.semantics.filter(function(item, index, array) {
			if (item.visibility === 'private' && (user != item.user)) {
				return false;
			}
			return true;
		});
		if (err) {
			console.log(err);
		} else {
			/*
			 * Use the login object to fetch colours for each user and augment the semantic
			 * annotations
			 */
			painter.augmentAnnotations(data.semantics, [ painter.painters.colourByUser ], function(newSemantics) {
				data.semantics = newSemantics;
				res.json(data);
			});
		}
	});
});

/**
 * GET request for complete text and syntactic metadata only
 */
app.get("/api/completeText/:textId", function(req, res) {
	datastore.fetchCompleteText(req.params.textId, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			res.json(data);
		}
	});
});

/**
 * Retrieve the metadata for the specified text, metadata specified as { title : string, markers : {
 * int -> marker }, owners : [string] }
 */
app.get("/api/meta/:textId", function(req, res) {
	datastore.getTextMetadata(req.params.textId, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			res.json(data);
		}
	});
});

/**
 * Update the text metadata for the specified text ID. Metadata is specified as { title : string,
 * markers : { int -> marker }, owners : [string] }. Call will fail if the current metadata doesn't
 * have the current user as one of the owners. Returns { err : string | null, message : string } to
 * the callback. As a side effect this should trigger re-creation of the publicly visible BibJSON
 * fragments, if any, which represent this text in the 'all texts' view and the exposed BibServer
 * query API.
 * 
 * @TODO - should check that at least one owner exists within Textus, but as we can't currently
 *       remove people from projects through the UI this isn't a major issue.
 */
app.post("/api/meta/:textId", login.checkLogin, function(req, res) {
	var userId = req.session.user;
	datastore.getTextMetadata(req.params.textId, function(err, currentMetadata) {
		var foundUser = false;
		if (err) {
			console.log(err);
		} else {
			currentMetadata.owners.forEach(function(ownerId) {
				if (ownerId === userId) {
					foundUser = true;
				}
			});
			if (foundUser) {
				datastore.updateTextMetadata(req.params.textId, req.body, function(err, data) {
					if (err) {
						console.log(err);
					} else {
						// console.log("Updated metadata on server");
						// console.log(JSON.stringify(data, null, 2));
						var parsedMarkerSet = markers(data);
						var newRefs = parsedMarkerSet.discoverableBibJson();
						// console.log("Getting discoverable BibJSON");
						// console.log(JSON.stringify(newRefs, null, 2));
						datastore.replaceReferencesForText(req.params.textId, newRefs, function(err, response) {
							if (err) {
								console.log(err);
							} else {
								res.json(data);
							}
						});
					}
				});
			} else {
				console.log("Attempt to update a metadata document to which the user '" + userId
						+ "' doesn't have write access.");
			}
		}
	});
});

/**
 * Retrieve text metadata descriptions of the form { textId : string -> { title : string, owners :
 * [string] }}
 */
app.get("/api/uploads", function(req, res) {
	datastore.getTextStructureSummaries(function(err, data) {
		if (err) {
			console.log(err);
		} else {
			res.json(data);
		}
	});
});

/**
 * POST to /api/upload to upload a text into the session ready for review. Redirects to /#review
 * activity on the client which can then use the /api/review GET method to return the parsed data
 * and any error messages.
 */
app.post("/api/upload", login.checkLogin, function(req, res) {
	/* Carry parsed data or error message */
	var message = {
		data : null,
		error : null
	};
	/*
	 * Redirect to the /#review location after uploads, storing the message in the session before
	 * doing so
	 */
	var redirect = function() {
		req.session.upload = message;
		res.redirect('/#review');
	};
	if (req.body.format == null) {
		message.error = "No format specified when uploading data";
		redirect();
	} else {
		/* Locate an appropriate parser for this message format */
		var parser = parsers[req.body.format];
		if (parser === null) {
			message.error = "Can't locate a parser for format " + req.body.format;
			redirect();
		} else {
			if (req.files.text === null) {
				message.error = "No file uploaded!";
				redirect();
			} else {
				/* Read the file */
				fs.readFile(req.files.text.path, 'utf8', function(error, data) {
					if (error) {
						message.error = "Unable to get uploaded file text from path " + req.files.text.path;
						redirect();
					} else {
						if (data === "" || data === null) {
							message.error = "No data in file";
							redirect();
						} else {
							/*
							 * Have data, use the parser to interpret it and create the data object,
							 * storing it in the 'upload' property of the session.
							 */
							message.data = parser.parse(data);
							/* Redirect to the review page */
							redirect();
						}
					}
				});
			}
		}
	}
});

/**
 * Retrieves a previously stored parsed upload, returned as JSON of the form { data :
 * <parsed-data-object | null>, error : string | null }. If the error property is non-null the
 * client should display the error message in some fashion.
 */
app.get("/api/upload/review", login.checkLogin, function(req, res) {
	var message = req.session.upload;
	if (message === null) {
		message = {
			data : null,
			error : "No upload session in progress"
		};
	}
	res.json(message);
});

/**
 * Act on the review, accepts JSON body with { accept : boolean, title : string }. If accept is
 * 'true' then the data is sent to the data store for storage. The response message is of the form {
 * textId : string, error : string } where one of textId or error will be null. The client may use
 * this message to jump directly to the reader UI for the uploaded text. If 'accept' is set to false
 * this simply removes the file data from the session object and sends a blank response message.
 */
app.post("/api/upload/review", login.checkLogin, function(req, res) {
	if (req.body.accept === 'true') {
		var data = req.session.upload.data;
		if (!data) {
			res.json({
				textId : null,
				error : "No upload in progress"
			});
		} else {
			/* Add the user ID to the data object */
			data.metadata = {
				title : req.body.title,
				markers : {},
				owners : [ req.session.user ]
			};
			datastore.importData(data, function(err, textId) {
				if (err) {
					res.json({
						textId : null,
						error : err
					});
				} else {
					res.json({
						textId : textId,
						error : null
					});
				}
			});
		}
	} else {
		delete req.session.upload;
		res.json("Okay");
	}
});

/**
 * Expose the elasticSearch query endpoint from the datasource
 */
app.get("/api/texts-es", function(req, res) {
	var esQuery = JSON.parse(req.query.source);
	datastore.queryTexts(esQuery, function(err, data) {
		if (err) {
			console.log("Unable to query ES index for texts ", esQuery, err);
			res.send(err, 500);
		} else {
			res.json(data);
		}
	});
});

/**
 * POST to create new semantic annotation
 */
app.post("/api/semantics", login.checkLogin, function(req, res) {
	/*
	 * Create a new annotation object, adding the current logged in user and only copying the fields
	 * we need from the supplied object to ensure we don't end up with grot in the data store.
	 */
	var annotation = {
		user : req.session.user,
		type : req.body.type,
		payload : req.body.payload,
		start : parseInt(req.body.start),
		end : parseInt(req.body.end),
		textId : req.body.textId,
		visibility : req.body.visibility
	};
	datastore.createSemanticAnnotation(annotation, function(err, response) {
		if (err) {
			res.json(err);
		} else {
			annotation.id = response._id;
			login.getUser(annotation.user, function(user) {
				painter.augmentAnnotations([ annotation ], [ painter.painters.colourByUser ], function(newSemantics) {
					res.json(newSemantics[0]);
				});
			});
		}
	});
});

/**
 * POST new annotation data to update or delete an annotation. Set visibility to 'delete' on the
 * updated annotation to remove it from the store. Sends {success : bool, error : string} back on
 * completion.
 */
app.post("/api/semantics/:annotationId", login.checkLogin, function(req, res) {
	datastore.getSemanticAnnotation(req.params.annotationId, function(err, existingAnnotation) {
		if (err) {
			res.json({
				success : false,
				error : err
			});
			return;
		}
		/*
		 * Check that the current annotation is in a suitable state for update or delete and that
		 * the current user is the owner
		 */
		if (existingAnnotation.visibility === 'final') {
			res.json({
				success : false,
				error : "Annotation is final, can't be modified or deleted!"
			});
			return;
		}
		if (existingAnnotation.user != req.session.user) {
			res.json({
				success : false,
				error : "Attempt to modify or delete an annotation the user does not own!"
			});
			return;
		}
		var annotation = req.body;
		if (annotation.id != req.params.annotationId) {
			res.json({
				success : false,
				error : "Annotation ID on supplied annotation doesn't match HTTP resource!"
			});
			return;
		}
		if (annotation.visibility === 'delete') {
			/* Delete the annotation */
			datastore.deleteSemanticAnnotation(req.params.annotationId, function(err) {
				if (!err) {
					res.json({
						success : true,
						error : null
					});
				} else {
					res.json({
						success : false,
						error : err
					});
				}
			});
		} else {
			var annotationToStore = {
				user : existingAnnotation.user,
				type : annotation.type,
				payload : annotation.payload,
				start : existingAnnotation.start,
				end : existingAnnotation.end,
				textId : existingAnnotation.textId,
				visibility : annotation.visibility
			};
			/* Update the annotation */
			datastore.updateSemanticAnnotation(annotationToStore, req.params.annotationId, function(err) {
				if (!err) {
					res.json({
						success : true,
						error : null
					});
				} else {
					res.json({
						success : false,
						error : err
					});
				}
			});
		}
	});
});

login.addRoutes(app, "api/");

datastore.init(function(err) {
	if (!err) {
		app.listen(conf.textus.port);
		console.log("Textus listening on port " + conf.textus.port);
	} else {
		console.log(err);
	}
});