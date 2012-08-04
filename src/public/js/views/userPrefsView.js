define([ 'text!templates/userPrefsView.html' ], function(template) {

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