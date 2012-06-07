/**
 * API call to retrieve a list of texts, find their top level structure nodes and return structs of
 * the form { textid:STRING, offset:INT, description:STRING, name:STRING } for each structure node
 * at depth 0. Where there are no structure nodes for a particular text the description and name
 * will reflect this and an entry will be created for index 0 in the text. The callback function
 * will be called with the resultant list.
 */
var retrieveTextList = function(callback) {
	$.getJSON("api/texts", function(data) {
		var texts = [];
		data.forEach(function(text) {
			var foundStructure = false;
			var textId = text.textid;
			text.structure.forEach(function(node) {
				if (node.depth == 0) {
					foundStructure = true;
					texts.push({
						textid : textId,
						offset : node.start,
						name : node.name,
						description : node.description
					});
				}
			});
			if (!foundStructure) {
				texts.push({
					textid : textId,
					offset : 0,
					name : "Unknown",
					description : "No description for text ID " + textId
				});
			}
		});
		callback(texts);
	});
};

define([ 'jquery', 'underscore', 'backbone', 'textus', 'views/listTextsView' ], function($, _, Backbone, textus,
		ListTextsView) {

	return function(models) {

		this.name = "ListTextsActivity";

		this.pageTitle = "All Texts";
		
		this.start = function() {
			var view = new ListTextsView();
			view.render();
			retrieveTextList(function(data) {
				view.setTextsList(data);
			});
		};

		this.stop = function(callback) {
			callback(true);
		};
	};

});