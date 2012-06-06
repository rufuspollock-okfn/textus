define([ 'jquery', 'underscore', 'backbone', 'views/registerUserView' ], function($, _, Backbone, RegisterUserView) {

	return function(models) {

		this.name = "RegisterUserActivity";

		this.start = function() {
			console.log("RegisterUser actitivity started");
			var view = new RegisterUserView();
			view.render();
			$('.main').empty();
			$('.main').append(view.el);
		};

		this.stop = function(callback) {
			callback(true);
		};
	};

});