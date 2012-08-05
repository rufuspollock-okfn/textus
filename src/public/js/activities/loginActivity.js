define([ 'textus', 'views/loginView', 'models', 'loginClient' ], function(textus, View, models, login) {
	return function(redirectTo) {

		var redirectTo = decodeURIComponent(redirectTo);

		this.name = "LoginActivity";

		this.pageTitle = "Log In or Register";

		this.start = function() {
			$('#LoginActivity').addClass('active');
			console.log("Login / registration activity started");
			var view = new View();
			view.render();

			/* Register */
			$('#register-button').click(function() {
				view.clearMessage();
				login.createUser(view.getValue().email, function(response) {
					view.showMessage(response);
				});
				return false;
			});
			/* Forgot password */
			$('#forgot-password-button').click(function() {
				view.clearMessage();
				login.resetPassword(view.getValue().email, function(response) {
					view.showMessage(response);
				});
				return false;
			});
			/* Log in */
			$('#log-in-button').click(function() {
				view.clearMessage();
				login.login(view.getValue().email, view.getValue().password, function(response) {
					view.showMessage(response);
					if (response.success) {
						window.location.replace("/" + redirectTo);
					}
				});
				return false;
			});

		};

		this.stop = function(callback) {
			$('#LoginActivity').removeClass('active');
			callback(true);
		};
	};
});