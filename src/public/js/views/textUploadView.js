define([ 'jquery', 'underscore', 'backbone', 'form', 'text!templates/textUploadView.html' ], function($, _, Backbone,
		Form, template) {

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);

		},

		render : function() {
			console.log("Rendering upload view");
			$(this.el).html(template);
			return this;
		}
	});

});