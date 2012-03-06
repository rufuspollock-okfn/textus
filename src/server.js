var express = require('express');
var app = express.createServer();
console.log(app);
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
app.get("/api", function(req, res) {
	res.send('[]');
});

// Start app on localhost:80
app.listen(80);
