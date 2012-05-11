/**
 * ElasticSearch based implementation of the data store.
 */

var buildRangeQuery = function(textid, start, end) {
	return {
		"query" : {
			"bool" : {
				"must" : [ {
					"text" : {
						"textid" : textid
					}
				}, {
					"range" : {
						"start" : {
							"lt" : end
						}
					}
				}, {
					"range" : {
						"end" : {
							"gte" : start
						}
					}
				} ]
			}
		}
	};
};

module.exports = exports = function(args) {

	var elastical = require('elastical');
	var client = new elastical.Client();

	return {
		fetchText : function(textId, textStart, textEnd) {
			//
		},
		fetchStructure : function(textId) {
			//
		},
		importData : function(textId, data) {
			/* Join the text parts together, then strip them into chunks for storage */

		}
	};

};
