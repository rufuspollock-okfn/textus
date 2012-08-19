// Router, loads appropriate pages based on target URL
define(
		[ 'activities/appActivity', 'activities/readTextActivity', 'activities/listTextsActivity', 'views/loginView',
				'activities/textUploadActivity', 'activities/userPrefsActivity', 'activities/reviewTextUploadActivity',
				'activities/createPasswordActivity', 'activities/loginActivity', 'activities/testActivity',
				'activities/editTextMetadataActivity', 'activities/myUploadsActivity', 'activities/snippetActivity',
				'models' ], function(AppActivity, ReadTextActivity, ListTextsActivity, LoginView, TextUploadActivity,
				UserPrefsActivity, ReviewTextUploadActivity, CreatePasswordActivity, LoginActivity, TestActivity,
				EditTextMetadataActivity, MyUploadsActivity, SnippetActivity, models) {

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
					'meta/:textId' : 'textMeta',
					'uploads' : 'uploads',
					'snippet/:textId/:startOffset/:endOffset' : 'snippet',
					'*actions' : 'defaultActions'
				},

				uploads : function() {
					this.startActivity(new MyUploadsActivity());
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

				snippet : function(textId, startOffset, endOffset) {
					this.startActivity(new SnippetActivity(textId, parseInt(startOffset), parseInt(endOffset), appRouter));
				},

				textMeta : function(textId) {
					this.startActivity(new EditTextMetadataActivity(textId));
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