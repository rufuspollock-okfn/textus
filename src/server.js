var express = require('express');
var app = express.createServer();
var args = require('optimist')
	.usage('Usage: $0 --port [num]')
	.default("port", 8080)
	.alias('p', 'port')
	.describe('p', 'The port number on which the server should listen for connections.').argv;
var datastore = require('./js/datastore/dataStore-test.js');

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


// Check that we can intercept routes
app.get("/api/text/:textid/:start/:end", function(req, res) {
		res.json(datastore.fetchText(req.params.textid, parseInt(req.params.start), parseInt(req.params.end)));
});

// Start app on localhost:80
app.listen(args.port);
console.log("Textus listening on port "+args.port);
