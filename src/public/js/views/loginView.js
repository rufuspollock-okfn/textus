define([ 'text!templates/loginView.html' ], function(layoutTemplate) {
	return Backbone.View.extend({

		el : '.main',

		intialize : function() {
			_.bindAll(this);
			this.presenter = this.options.presenter;
		},

		render : function() {
			$(this.el).html(layoutTemplate);
		}

	});

});