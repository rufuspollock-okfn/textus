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

var fs = require('fs');
var dummyData = JSON.parse(fs.readFileSync(__dirname
		+ "/public/mock-data/test-data.json"));

console.log("Loaded test data.");

var overlapsRange = function(startA, endA, startB, endB) {
	return ((startA <= startB && endA >= endB)
			|| (startB <= startA && endB >= endA)
			|| (startB <= startA && endB >= startA) || (startB <= endA && endB >= endA));
};

var clamp = function(min, max, value) {
	return Math.max(Math.min(max, value), min);
};

// Check that we can intercept routes
app.get("/api/text/:textid/:start/:end", function(req, res) {
	console.log("Request for text chunk - {textid:" + req.params.textid
			+ ", start:" + req.params.start + ", end:" + req.params.end + "}");
	var start = clamp(0, dummyData.text.length, parseInt(req.params.start));
	var end = clamp(0, dummyData.text.length, parseInt(req.params.end));
	var includeAnnotation = function(annotation) {
		return overlapsRange(start, end, annotation.start, annotation.end);
	};
	var data = {
		start : start,
		end : end,
		text : dummyData.text.substring(start, end),
		typography : dummyData.typography.filter(includeAnnotation),
		semantics : dummyData.semantics.filter(includeAnnotation)
	};
//	console.log("Returning data :");
//	console.log(data);
	res.json(data);
});

// Start app on localhost:80
app.listen(8080);
console.log("Server running");
