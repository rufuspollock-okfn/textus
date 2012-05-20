define([ 'jquery', 'underscore', 'backbone', 'textus', 'views/appView' ], function($, _, Backbone, textus, AppView) {
	return function(models) {

		this.name = "AppActivity";

		this.start = function() {
			console.log("App actitivity started");
			var appView = new AppView({
				presenter : {

					getCurrentUser : function(callback) {
						console.log("getCurrentUser");
						$.getJSON("api/user", function(data) {
							console.log(data);
							callback(data);
							if (data.loggedin) {
								models.loginModel.set({
									loggedIn : data.loggedin,
									user : data.details.user
								});
							} else {
								models.loginModel.set({
									loggedIn : false,
									user : null
								});
							}
						});
					},

					logout : function() {
						console.log("logout");
						$.post("api/logout", function(data) {
							appView.render();
						});
					},

					login : function(user, password) {
						console.log("login");
						$.post("api/login", {
							user : user,
							password : password
						}, function(data) {
							console.log("Login response");
							console.log(data);
							appView.render();
						});
					}

				}
			});
			console.log(appView);
			appView.render();
		};

		this.stop = function(callback) {
			callback(true);
		};
	};
});