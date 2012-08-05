define([ 'textus', 'views/loginView', 'models' ], function(textus, View, models) {
	return function(redirectTo) {

		var redirectTo = decodeURIComponent(redirectTo);

		this.name = "LoginActivity";

		this.pageTitle = "Log In or Register";

		this.start = function() {
			$('#LoginActivity').addClass('active');
			console.log("Login / registration activity started");
			var view = new View({
				presenter : {
					/**
					 * Log in
					 */
					login : function(user, password) {
						$.post("api/login", {
							id : user,
							password : password
						}, function(data) {
							console.log("Login response");
							console.log(data);
							if (data.okay == false) {
								window.alert("Username / Password pair not recognized.");
							}
							loginView.render();
						});
					}
				}
			});
			view.render();
		};

		this.stop = function(callback) {
			$('#LoginActivity').removeClass('active');
			callback(true);
		};
	};
});