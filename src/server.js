var express = require('express');
var app = express.createServer();
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
	secret : "my secret..."
}));
var args = require('optimist').usage('Usage: $0 --port [num]').default("port", 8080).alias('p', 'port').describe('p',
		'The port number on which the server should listen for connections.').argv;
var datastore = require('./js/datastore/dataStore-elastic.js')(args);
var login = require('./js/login.js')(datastore);

app.configure(function() {
	app.use(express.bodyParser());
	app.use(app.router);
	// Declare local routes to serve public content
	app.use(express.static(__dirname + "/public"));
	app.use(express.errorHandler({
		dumpExceptions : true,
		showStack : true
	}));
});

// GET requests for text and annotation data
app.get("/api/text/:textid/:start/:end", function(req, res) {
	datastore.fetchText(req.params.textid, parseInt(req.params.start), parseInt(req.params.end), function(err, data) {
		if (err) {
			console.log(err);
		} else {
			res.json(data);
		}
	});
});

// GET request for a list of all texts along with their structure (used to display the list of
// texts)
app.get("/api/texts", function(req, res) {
	datastore.getTextStructures(function(err, data) {
		if (err) {
			console.log(err);
		} else {
			res.json(data);
		}
	});
});

// Posts to /api/texts to create a new text through a file upload
app.post("/api/texts", login.checkLogin, function(req, res) {
	console.log(req.body);
	console.log(req.files.text);
	datastore.loadFromWikiTextFile(req.files.text.path, req.body.title, req.body.description, function(err, textId) {
		if (!err) {
			console.log("Returned from datastore call...");
			res.redirect('/#text/' + textId + '/0');
		} else {
			console.log(err);
			res.json(err);
		}
	});
});

// GET request for current user, returns {login:BOOLEAN, user:STRING}, where user is absent if there
// is no logged in user.
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

/* Create new semantic annotation */
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
			res.json(annotation);
		}
	});

});

/* Log into the server */
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

/* Create a new user */
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

/* Log out */
app.post("/api/logout", function(req, res) {
	login.logout(req);
	res.json("Okay");
});

// Start app on whatever port is configured, defaulting to 8080 if not specified.
app.listen(args.port);
console.log("Textus listening on port " + args.port);
