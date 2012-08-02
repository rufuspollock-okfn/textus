define([ 'jquery', 'underscore', 'backbone', 'text!templates/createPasswordView.html', 'form' ], function($, _, Backbone,
		layoutTemplate, Form) {

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);

		},

		render : function() {
			$('.main').html(layoutTemplate);
			return this;
		}

	});

});