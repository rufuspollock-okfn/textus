module.exports = exports = function(args) {

	var wikitext = require("./wikitext-parser.js");
	var http = require('http');

	var fetchFromWikiSource = function(callback, title) {
		http.get({
			host : "en.wikisource.org",
			port : 80,
			headers : {
				"User-Agent" : "textus-harvester, tom.oinn@okfn.org"
			},
			path : "/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=" + title
		}, function(res) {
			// console.log(res);
			var pageData = "";
			res.setEncoding('utf8');
			res.on('data', function(chunk) {
				pageData += chunk;
			});
			res.on('end', function() {
				var o = JSON.parse(pageData);
				for ( var pageId in o.query.pages) {
					if (o.query.pages.hasOwnProperty(pageId)) {
						var result = wikitext.readWikiText(o.query.pages[pageId].revisions[0]["*"]);
						callback(result.text, result.typography);
					}
				}
			});
		});
	};

	return {

		import : fetchFromWikiSource

	};

};
