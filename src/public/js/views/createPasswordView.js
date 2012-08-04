define([ 'text!templates/createPasswordView.html' ], function(layoutTemplate) {

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