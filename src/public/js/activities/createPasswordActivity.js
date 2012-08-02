define([ 'jquery', 'underscore', 'backbone', 'textus', 'views/createPasswordView' ], function($, _, Backbone, textus, View) {
	return function(models, userId, confirmationKey) {

		this.name = "CreatePasswordActivity";
		
		this.pageTitle = "Set Password";

		this.start = function() {
			console.log("Create password activity started");
			var view = new View();
			view.render();
		};

		this.stop = function(callback) {
			callback(true);
		};
	};
});