define([ 'textus', 'views/textUploadView', 'models' ], function(textus, TextUploadView, models) {
	return function() {

		this.name = "TextUploadActivity";

		this.pageTitle = "Text Upload";

		this.start = function() {
			var view = new TextUploadView({
				loginModel : models.loginModel
			});
			view.render();
			$('.main').empty();
			$('.main').append(view.el);
			var renderFunction = function() {
				view.render();
			};
			models.loginModel.bind("change", renderFunction);

			return [ {
				event : "change",
				model : models.loginModel,
				handler : renderFunction
			} ];
		};

		this.stop = function(callback) {
			callback(true);
		};

	};
});