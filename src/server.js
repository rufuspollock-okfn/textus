var express = require('express');
var app = express.createServer();

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
app
		.get(
				"/api/text/:textid/:fromchar",
				function(req, res) {
					var data = {
						start : req.params.fromchar,
						text : "This is a piece of text which will be returned to the client, it's from text "
								+ req.params.textid
								+ " and starts at character "
								+ req.params.fromchar,
						annotations : [ {
							start : 0,
							end : 10,
							css : "annotation1"
						}, {
							start : 10,
							end : 60,
							css : "annotation2"
						} ]
					};
					res.json(data);
				});

// Start app on localhost:80
app.listen(8080);
console.log("Server running");
