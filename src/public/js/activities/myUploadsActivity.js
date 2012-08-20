define([ 'views/myUploadsView', 'models' ], function(View, models) {
	return function() {

		this.name = "MyUploadsActivity";

		this.pageTitle = "My Uploads";

		this.start = function() {
			if (models.loginModel.get("loggedIn") === true) {
				var userId = models.loginModel.get("user").id;
				var view = new View();
				view.render();
				$.getJSON("api/uploads", function(uploads) {
					$('#uploadsTableBody').empty();
					$.each(uploads, function(textId, summary) {
						var foundMe = false;
						summary.owners.forEach(function(owner) {
							if (owner === userId) {
								foundMe = true;
							}
						});
						if (foundMe) {
							$('#uploadsTableBody').append(
									"<tr><td><a class='btn btn-info' href='#meta/" + textId
											+ "'>Curate</a><span style='line-height: 28px; padding-left: 10px'>"
											+ summary.title + "</span></td></tr>");
						}
					});
				});
			} else {
				window.location.replace("/#login");
			}
		};

		this.stop = function(callback) {
			callback(true);
		};
	};
});