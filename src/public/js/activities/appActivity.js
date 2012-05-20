define([ 'jquery', 'underscore', 'backbone', 'textus', 'views/appView' ], function($, _, Backbone, textus, AppView) {
	return function(models) {

		this.name = "AppActivity";

		this.start = function() {
			console.log("App actitivity started");
			var appView = new AppView({
				presenter : {
					getCurrentUser : function(callback) {
						callback({
							loggedin : false
						});
					}
				}
			});
			console.log(appView);
			appView.render();
		};

		this.stop = function(callback) {
			callback(true);
		};
	};
});