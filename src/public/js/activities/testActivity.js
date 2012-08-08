define([ 'views/testView' ], function(View) {
	return function() {

		this.name = "TestActivity";

		this.pageTitle = "Textus Component Tests";

		this.start = function() {

			var view = new View();
			view.render();
		};

		this.stop = function(callback) {
			callback(true);
		};
	};
});