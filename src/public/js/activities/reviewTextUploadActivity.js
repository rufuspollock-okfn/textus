define([ 'textus', 'views/reviewTextUploadView' ], function(textus, ReviewTextUploadView) {

	var setReviewSize = function() {
		$('#tab1').height($(window).height() - $('#tab1').offset().top - 10);
	};

	return function() {

		this.name = "ReviewTextUploadActivity";

		this.pageTitle = "Review Text Upload";

		this.start = function() {
			var view = new ReviewTextUploadView({
				el : $('.main')
			});
			view.render();
			$.getJSON("api/upload/review", function(message) {
				console.log(message);
				if (message.data) {
					view.setText(message.data);
					$('#reviewTab>li>a:first', view.el).tab('show');
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
					window.location.href = "#texts";
				});
			});
			$('#rejectReviewButton').click(function(e) {
				$.post("api/upload/review", {
					accept : false
				}, function(data) {
					window.location.href = "#upload";
				});
			});
			$(window).resize(setReviewSize);
			setReviewSize();
		};

		this.stop = function(callback) {
			$(window).unbind("resize");
			callback(true);
		};

	};
});