define([ 'jquery', 'underscore', 'backbone', 'textus', 'views/appView' ], function($, _, Backbone, textus, AppView) {
	return function(models) {

		this.name = "AppActivity";

		this.start = function() {
			var appView = new AppView();
			appView.render();
		};

		this.stop = function(callback) {
			callback(true);
		};
	};
});