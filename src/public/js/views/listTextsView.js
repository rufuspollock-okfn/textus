define([ 'text!templates/listTextsView.html', 'textus' ], function(layoutTemplate, textus) {
	return Backbone.View.extend({

		el : '.main',

		intialize : function() {
		},

		render : function() {
			$(this.el).html(layoutTemplate);
			$('#facetText').facetview(
					{
						search_url : '/api/texts-es?',
						search_index : 'elasticsearch',
						facets : [ {
							'field' : 'author.lastname',
							'display' : 'author'
						}, {
							'field' : 'year',
							'display' : 'year'
						} ],
						renderer : function(hit, parent) {
							if (hit.textus && hit.textus.textId && hit.textus.offset) {
								parent.append("<a href='#/text/" + hit.textus.textId + "/" + hit.textus.offset + "'>"
										+ textus.renderBibJson(hit) + "</a>");
							}
						}
					});
		}

	});

});