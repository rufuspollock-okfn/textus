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

var checkLogin = function(req, res, next) {
	if (!req.session.user) {
		res.send('Not authorized', 401);
	} else {
		next();
	}
};

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

// GET request for current user, returns {login:BOOLEAN, user:STRING}, where user is absent if there
// is no logged in user.
app.get("/api/user", function(req, res) {
	if (!req.session.user) {
		res.json({
			loggedin : false
		});
	} else {
		res.json({
			loggedin : true,
			details : {
				user : req.session.user
			}
		});
	}
});

/* Create new semantic annotation */
app.post("/api/semantics", checkLogin, function(req, res) {
	var annotation = {
		user : req.session.user,
		type : req.body.type,
		payload : req.body.payload,
		start : parseInt(req.body.start),
		end : parseInt(req.body.end),
		textid : req.body.textId,
		colour : "rgba(255,100,23,0.2)"
	};
	datastore.createSemanticAnnotation(annotation, function(err, response) {
		if (err) {
			res.json(err);
		}
		else {
			annotation.id = response._id;
			res.json(annotation);
		}
	});
	
});

/* Log into the server */
app.post("/api/login", function(req, res) {
	// TODO - login logic!
	var user = req.body.user;
	var password = req.body.password;
	req.session.user = user;
	res.json("Okay");
});

/* Log out */
app.post("/api/logout", function(req, res) {
	delete req.session.user;
	res.json("Okay");
});

// Start app on whatever port is configured, defaulting to 8080 if not specified.
app.listen(args.port);
console.log("Textus listening on port " + args.port);
