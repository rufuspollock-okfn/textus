define([ 'views/myUploadsView', 'models' ], function(View, models) {
	return function() {

		this.name = "MyUploadsActivity";

		this.pageTitle = "My Uploads";

		this.start = function() {
			console.log("My uploads actitivity started");
			var view = new View();
			view.render();
			$.getJSON("api/uploads", function(uploads) {
				$('#uploadsTableBody').empty();
				$.each(uploads, function(textId, summary) {
					$('#uploadsTableBody').append(
							"<tr><td><a class='btn btn-info' href='#meta/" + textId
									+ "'>Curate</a><span style='line-height: 28px; padding-left: 10px'>"
									+ summary.title + "</span></td></tr>");
				});
			});
		};

		this.stop = function(callback) {
			callback(true);
		};
	};
});