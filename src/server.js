var express = require('express');
var app = express.createServer();
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


// Start app on whatever port is configured, defaulting to 8080 if not specified.
app.listen(args.port);
console.log("Textus listening on port " + args.port);
