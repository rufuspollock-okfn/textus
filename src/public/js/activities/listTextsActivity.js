define([ 'textus', 'views/listTextsView' ], function(textus, ListTextsView) {

	return function() {

		this.name = "ListTextsActivity";

		this.pageTitle = "All Texts";

		this.start = function() {
			var view = new ListTextsView();
			view.render();
		};

		this.stop = function(callback) {
			callback(true);
		};
	};

});