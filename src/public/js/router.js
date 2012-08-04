// Router, loads appropriate pages based on target URL
define([ 'activities/appActivity', 'activities/readTextActivity', 'activities/listTextsActivity', 'views/loginView',
		'activities/textUploadActivity', 'activities/registerUserActivity', 'activities/userPrefsActivity',
		'activities/reviewTextUploadActivity', 'activities/createPasswordActivity', 'models' ], function(AppActivity,
		ReadTextActivity, ListTextsActivity, LoginView, TextUploadActivity, RegisterUserActivity, UserPrefsActivity,
		ReviewTextUploadActivity, CreatePasswordActivity, models) {

	/**
	 * Router defined here, add client-side routes here to handle additional pages and manage
	 * history sensibly.
	 */
	var appRouter = new (Backbone.Router.extend({

		routes : {
			'text/:textId/:offset' : 'text',
			'texts' : 'texts',
			'upload' : 'uploadText',
			'user-options' : 'userPrefs',
			'register' : 'register',
			'review' : 'review',
			'password/:userId/:confirmKey' : 'password',
			'*actions' : 'defaultActions'
		},

		texts : function() {
			this.startActivity(new ListTextsActivity(models));
		},

		text : function(textId, offset) {
			this.startActivity(new ReadTextActivity(models), {
				textId : textId,
				offset : parseInt(offset),
				router : appRouter
			});
		},

		password : function(userId, confirmKey) {
			this.startActivity(new CreatePasswordActivity(models, decodeURIComponent(userId),
					decodeURIComponent(confirmKey)));
		},

		uploadText : function() {
			this.startActivity(new TextUploadActivity(models), null);
		},

		userPrefs : function() {
			this.startActivity(new UserPrefsActivity(models), null);
		},

		register : function() {
			this.startActivity(new RegisterUserActivity(models), null);
		},

		review : function() {
			this.startActivity(new ReviewTextUploadActivity(models), null);
		},

		defaultActions : function() {
			this.startActivity(new AppActivity(models), null);
		}

	}));

	/* Set up the overall page infrastructure */
	var loginView = new LoginView({
		presenter : {

			getCurrentUser : function(callback) {
				console.log("getCurrentUser");
				$.getJSON("api/user", function(data) {
					console.log(data);
					callback(data);
					if (data.loggedin) {
						models.loginModel.set({
							loggedIn : data.loggedin,
							user : data.user
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
					window.location.replace("/#");
					loginView.render();
				});
			},

			login : function(user, password) {
				console.log("login");
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
			},

			lostPassword : function(user) {
				$.getJSON("api/sendmail/" + encodeURIComponent(user), function(data) {
					console.log(data);
				});
			}

		}
	});

	return {
		initialize : function() {
			loginView.render();
			models.loginModel.bind("change", function() {
				loginView.render();
			});
			Backbone.history.start();
		}
	};

});