define([ 'jquery', 'underscore', 'backbone', 'text!templates/listTextsView.html' ], function($, _, Backbone,
		layoutTemplate) {
	return Backbone.View.extend({
		el : '.main',
		intialize : function() {
		},
		render : function() {
			$(this.el).html(layoutTemplate);
			$('#facetText').facetview({
				search_url : '/api/texts-es?',
				search_index : 'elasticsearch',
				facets : [ {
					'field' : 'publisher.exact',
					'size' : 100,
					'order' : 'term',
					'display' : 'publisher'
				}, {
					'field' : 'author.name.exact',
					'display' : 'author'
				}, {
					'field' : 'year.exact',
					'display' : 'year'
				} ],
			});

		},
		/**
		 * Called with an array of { textId:STRING, offset:INT, description:STRING, name:STRING }
		 * containing any texts which should be listed here. Use to create links to
		 * #text/[textId]/[OFFSET]
		 */
		setTextsList : function(data) {
			console.log(data);
			$('#textList').empty();
			data.forEach(function(text) {
				var d = $('<div/>');
				var desc = $('<div>').text(text.description);
				var a = $('<a href="#text/' + text.textId + '/' + text.offset + '">' + text.name + '</a>');
				d.append(a, desc);
				$('#textList').append(d);
				d.click(function() {
					window.location.href = "#text/" + text.textId + "/" + text.offset;
				});
			});
		}
	});

});