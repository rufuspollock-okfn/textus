define([ 'jquery', 'underscore', 'backbone', 'textus', 'views/reviewTextUploadView' ], function($, _, Backbone, textus,
		ReviewTextUploadView) {
	return function(models) {

		this.name = "ReviewTextUploadActivity";

		this.pageTitle = "BibJSON Form Test";

		this.start = function() {
			var view = new ReviewTextUploadView();
			view.render();
			$('.main').empty();
			$('.main').append(view.el);
		};

		this.stop = function(callback) {
			callback(true);
		};

	};
});