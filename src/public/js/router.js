// Router, loads appropriate pages based on target URL
define([ 'activities/appActivity', 'activities/readTextActivity', 'activities/listTextsActivity', 'views/loginView',
		'activities/textUploadActivity', 'activities/userPrefsActivity', 'activities/reviewTextUploadActivity',
		'activities/createPasswordActivity', 'activities/loginActivity', 'activities/testActivity', 'models' ],
		function(AppActivity, ReadTextActivity, ListTextsActivity, LoginView, TextUploadActivity, UserPrefsActivity,
				ReviewTextUploadActivity, CreatePasswordActivity, LoginActivity, TestActivity, models) {

			/**
			 * Router defined here, add client-side routes here to handle additional pages and
			 * manage history sensibly.
			 */
			var appRouter = new (Backbone.Router.extend({

				routes : {
					'text/:textId/:offset' : 'text',
					'texts' : 'texts',
					'login/:redirectTo' : 'login',
					'upload' : 'uploadText',
					'account' : 'userPrefs',
					'register' : 'register',
					'review' : 'review',
					'password/:userId/:confirmKey' : 'password',
					'test' : 'test',
					'*actions' : 'defaultActions'

				},

				texts : function() {
					this.startActivity(new ListTextsActivity());
				},

				text : function(textId, offset) {
					this.startActivity(new ReadTextActivity(), {
						textId : textId,
						offset : parseInt(offset),
						router : appRouter
					});
				},

				password : function(userId, confirmKey) {
					this.startActivity(new CreatePasswordActivity(decodeURIComponent(userId),
							decodeURIComponent(confirmKey)));
				},

				login : function(redirectTo) {
					this.startActivity(new LoginActivity(decodeURIComponent(redirectTo)));
				},

				uploadText : function() {
					this.startActivity(new TextUploadActivity());
				},

				userPrefs : function() {
					this.startActivity(new UserPrefsActivity());
				},

				register : function() {
					this.startActivity(new RegisterUserActivity());
				},

				review : function() {
					this.startActivity(new ReviewTextUploadActivity());
				},

				defaultActions : function() {
					this.startActivity(new AppActivity());
				},

				test : function() {
					this.startActivity(new TestActivity());
				}

			}));

			return {
				initialize : function() {
					Backbone.history.start();
				}
			};

		});