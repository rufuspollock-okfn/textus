define(['textus', 'views/appView' ], function(textus, AppView) {
	return function() {

		this.name = "AppActivity";
		
		this.pageTitle = "TEXTUS Beta";

		this.start = function() {
			console.log("App actitivity started");
			var appView = new AppView();
			appView.render();
		};

		this.stop = function(callback) {
			callback(true);
		};
	};
});