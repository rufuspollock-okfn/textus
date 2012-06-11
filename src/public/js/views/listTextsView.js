define([ 'jquery', 'underscore', 'backbone', 'text!templates/listTextsView.html' ], function($, _, Backbone,
		layoutTemplate) {
	return Backbone.View.extend({
		el : '.main',
		intialize : function() {
		},
		render : function() {
			$(this.el).html(layoutTemplate);
		},
		/**
		 * Called with an array of { textid:STRING, offset:INT, description:STRING, name:STRING }
		 * containing any texts which should be listed here. Use to create links to
		 * #text/[TEXTID]/[OFFSET]
		 */
		setTextsList : function(data) {
			console.log(data);
			$('#textList').empty();
			data.forEach(function(text) {
				var d = $('<div/>');
				var desc = $('<div>').text(text.description);
				var a = $('<a href="#text/' + text.textid + '/' + text.offset + '">' + text.name + '</a>');
				d.append(a, desc);
				$('#textList').append(d);
				d.click(function() {
					window.location.href = "#text/" + text.textid + "/" + text.offset;
				});
			});
		}
	});

});