define([ 'jquery', 'underscore', 'backbone', 'textus', 'views/textUploadView' ], function($, _, Backbone, textus,
		TextUploadView) {
	return function(models) {

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