define([ 'text!templates/userPrefsView.html', 'gravatar' ], function(template, gravatar) {

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);
		},

		render : function() {
			console.log("Rendering user preferences view");
			$(this.el).html(template);
			$('#gravatar', this.el).attr("src", gravatar.gravatarURL(80));
			return this;
		}

	});

});