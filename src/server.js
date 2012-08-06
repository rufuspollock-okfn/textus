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
		if (err) {
			console.log(err);
		} else {
			// Use the login object to fetch colours for each user and augment the
			// semantic
			// annotations
			painter.augmentAnnotations(data.semantics, [ painter.painters.colourByUser ], function(newSemantics) {
				data.semantics = newSemantics;
				res.json(data);
			});
		}
	});
});

/**
 * GET request for a list of all texts along with their structure (used to display the list of
 * texts)
 */
app.get("/api/texts", function(req, res) {
	datastore.getTextStructures(function(err, data) {
		if (err) {
			console.log(err);
		} else {
			res.json(data);
		}
	});
});

/**
 * POST to /api/texts to upload a text into the session ready for review. Redirects to /#review
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
 * Act on the review, accepts JSON body with { accept : boolean, refs : [ { bibjson : Object, index :
 * int } ... ] }. If accept is 'true' then the data is sent to the data store for storage. Once a
 * text ID has been allocated any bibJSON objects submitted are augmented with the textus specific
 * metadata and sent to the data store for storage. The response message is of the form { textId :
 * string, error : string } where one of textId or error will be null. The client may use this
 * message to jump directly to the reader UI for the uploaded text. If 'accept' is set to false this
 * simply removes the file data from the session object and sends a blank response message.
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
			data.user = req.session.user;
			datastore.importData(data, function(err, textId) {
				if (err) {
					res.json({
						textId : null,
						error : err
					});
				} else {
					/*
					 * Have the Text ID, augment the bibliographic references (if any) with the
					 * textus-specific metadata and send them to be stored
					 */
					var refsToStore = req.body.refs.map(function(ref) {
						ref.textus = {
							role : 'text',
							textId : textId,
							userId : req.session.user
						};
						return ref;
					});
					datastore.storeBibliographicReferences(refsToStore, function(err) {
						if (err) {
							res.json({
								textId : null,
								error : err
							});
						} else {
							delete req.session.upload;
							res.json({
								textId : textId,
								error : null
							});
						}
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
	var annotation = {
		user : req.session.user,
		type : req.body.type,
		payload : req.body.payload,
		start : parseInt(req.body.start),
		end : parseInt(req.body.end),
		textId : req.body.textId
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

login.addRoutes(app, "api/");

app.listen(conf.textus.port);
console.log("Textus listening on port " + conf.textus.port);
