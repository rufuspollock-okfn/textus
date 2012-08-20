define([ 'views/userPrefsView', 'models' ], function(UserPrefsView, models) {

	return function() {

		this.name = "UserPrefsActivity";

		this.pageTitle = "Preferences";

		this.start = function() {
			console.log("UserPrefs actitivity started");
			var view = new UserPrefsView({
				loginModel : models.loginModel,
				presenter : {
					updatePrefs : function() {
						$.post("api/login/user/prefs", view.getPrefs(), function(response) {
							if (response.success) {
								window.location.reload();
							} else {
								console.log(response);
							}
						});
					}
				}
			});
			view.render();
			$('.main').empty();
			$('.main').append(view.el);
			view.afterDisplay();
			var renderFunction = function() {
				view.setPrefs(models.loginModel.get("user").prefs);
			};
			view.setPrefs(models.loginModel.get("user").prefs);
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