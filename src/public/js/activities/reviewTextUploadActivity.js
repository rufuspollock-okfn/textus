define([ 'jquery', 'underscore', 'backbone', 'textus', 'views/reviewTextUploadView' ], function($, _, Backbone, textus,
		ReviewTextUploadView) {
	return function(models) {

		this.name = "ReviewTextUploadActivity";

		this.pageTitle = "Review Text Upload";

		this.start = function() {
			var view = new ReviewTextUploadView();
			view.render();
			$('.main').empty();
			$('.main').append(view.el);
			$.getJSON("api/upload/review", function(message) {
				console.log(message);
				if (message.data) {
					view.setText(message.data);
				} else {
					console.log(message);
				}
			});
			$('#acceptReviewButton').click(function(e) {
				var ref = view.getBibJson();
				$.post("api/upload/review", {
					accept : true,
					refs : [ ref ]
				}, function(data) {
					console.log(data);
					window.location.href="#texts";
				});
			});
			$('#rejectReviewButton').click(function(e) {
				$.post("api/upload/review", {
					accept : false
				}, function(data) {
					window.location.href = "#upload";
				});
			});
		};

		this.stop = function(callback) {
			callback(true);
		};

	};
});