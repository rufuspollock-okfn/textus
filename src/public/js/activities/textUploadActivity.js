define(
		[ 'jquery', 'underscore', 'backbone', 'textus', 'views/textUploadView' ],
		function($, _, Backbone, textus, TextUploadView) {
			return function(models) {

				this.name = "TextUploadActivity";

				this.start = function() {
					console.log("App actitivity started");
					var view = new TextUploadView({
						loginModel : models.loginModel
					});
					view.render();
					$('.main').empty();
					$('.main').append(view.el);
					models.loginModel.bind("change", function() {
						view.render();
					});
				};

				this.stop = function(callback) {
					callback(true);
				};
			};
		});