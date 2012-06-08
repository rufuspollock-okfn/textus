// Textus configuration
var conf = require('./js/textusConfiguration.js').conf();
// Backend datastore, requires configuration
var datastore = require('./js/datastore/dataStore-elastic.js')(conf);
// Login and user helper, requires datastore
var login = require('./js/login.js')(datastore);
// Annotation painter, requires login helper
var painter = require('./js/annotationPainter.js')(login);

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
app.get("/api/text/:textid/:start/:end", function(req, res) {
	datastore.fetchText(req.params.textid, parseInt(req.params.start), parseInt(req.params.end), function(err, data) {
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
 * POST to /api/texts to create a new text through a file upload
 */
app.post("/api/texts", login.checkLogin, function(req, res) {
	datastore.loadFromWikiTextFile(req.files.text.path, req.body.title, req.body.description, function(err, textId) {
		if (!err) {
			res.redirect('/#text/' + textId + '/0');
		} else {
			console.log(err);
			res.json(err);
		}
	});
});

/**
 * GET request for current user, returns {login:BOOLEAN, user:STRING}, where user is absent if there
 * is no logged in user.
 */
app.get("/api/user", function(req, res) {
	login.getCurrentUser(req, function(user) {
		if (user == null) {
			res.json({
				loggedin : false
			});
		} else {
			res.json({
				loggedin : true,
				details : user
			});
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
		textid : req.body.textId
	};
	datastore.createSemanticAnnotation(annotation, function(err, response) {
		if (err) {
			res.json(err);
		} else {
			annotation.id = response._id;
			login.getUser(annotation.user, function(user) {
				if (user) {
					painter.painters.colourByUser(annotation, user);
				}
				res.json(annotation);
			});
		}
	});
});

/**
 * POST to log into the server
 */
app.post("/api/login", function(req, res) {
	login.login(req, function(result) {
		if (result == null) {
			res.json({
				okay : false,
				user : null
			});
		} else {
			res.json({
				okay : true,
				user : result
			});
		}
	});
});

/**
 * POST to create a new user
 */
app.post("/api/users", function(req, res) {
	login.createUser(req.body.id, req.body.password, function(newUser) {
		if (newUser == null) {
			res.json({
				okay : false
			});
		} else {
			res.json({
				okay : true,
				user : newUser
			});
		}
	});
});

/**
 * POST to log out of any current active session
 */
app.post("/api/logout", function(req, res) {
	login.logout(req);
	res.json("Okay");
});

app.listen(conf.textus.port);
console.log("Textus listening on port " + conf.textus.port);
