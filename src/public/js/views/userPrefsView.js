define([ 'jquery', 'underscore', 'backbone', 'form', 'text!templates/userPrefsView.html' ], function($, _, Backbone,
		Form, template) {

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);
		},

		render : function() {
			console.log("Rendering user preferences view");
			$(this.el).html(template);
			return this;
		}

	});

});