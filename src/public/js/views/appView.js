define([ 'jquery', 'underscore', 'backbone', 'text!templates/appView.html' ],
		function($, _, Backbone, layoutTemplate) {
			return Backbone.View.extend({
				el : '.main',
				intialize : function() {
				},
				render : function() {
					$(this.el).html(layoutTemplate);
				}
			});

		});