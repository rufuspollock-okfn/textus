define([ 'jquery', 'underscore', 'backbone', 'views/registerUserView' ], function($, _, Backbone, RegisterUserView) {

	return function(models) {

		this.name = "RegisterUserActivity";

		this.pageTitle = "New User";

		this.start = function() {
			console.log("RegisterUser actitivity started");
			var view = new RegisterUserView({
				presenter : {
					createAndLogIn : function(id, password, details) {
						console.log("Request to create new user received");
						console.log(id, password, details);
						$.post("api/users", {
							id : id,
							password : password
						}, function(response) {
							if (response.okay == false) {
								window.alert("Unable to create new user!");
							} else {
								$.post("api/login", {
									id : id,
									password : password
								}, function(data) {
									console.log("Login response");
									console.log(data);
									if (data.okay == false) {
										window.alert("Username / Password pair not recognized.");
									} else {
										$.getJSON("api/user", function(data) {
											console.log("Retrieved current user after registration");
											console.log(data);
											if (data.loggedin) {
												models.loginModel.set({
													loggedIn : data.loggedin,
													user : data.details
												});
											} else {
												models.loginModel.set({
													loggedIn : false,
													user : null
												});
											}
											window.location.replace("/#");
										});
									}
								});
							}
						});
					}
				}
			});
			view.render();
			$('.main').empty();
			$('.main').append(view.el);
			$('.login-wrapper').hide();
		};

		this.stop = function(callback) {
			$('.login-wrapper').show();
			callback(true);
		};
	};

});