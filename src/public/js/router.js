// Router, loads appropriate pages based on target URL
define([ 'jquery', 'underscore', 'backbone', 'activities/appActivity', 'activities/readTextActivity',
		'activities/listTextsActivity', 'views/loginView', 'form', 'activities/textUploadActivity',
		'activities/registerUserActivity', 'activities/userPrefsActivity' ], function($, _, Backbone, AppActivity,
		ReadTextActivity, ListTextsActivity, LoginView, Form, TextUploadActivity, RegisterUserActivity,
		UserPrefsActivity) {

	/**
	 * Extend a close() operation to all views to help remove potential zombie listeners and
	 * elements. Code and general method / help from
	 * http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/
	 */
	Backbone.View.prototype.close = function() {
		this.remove();
		this.unbind();
		if (this.onClose) {
			this.onClose();
		}
	};

	/**
	 * Models are application-lifecycle scoped and are used to hold all state.
	 */
	var models = {
		/*
		 * Hold the current logged in user record, used to determine whether certain UI components
		 * should be active
		 */
		loginModel : new (Backbone.Model.extend({
			defaults : {
				user : null,
				loggedIn : false
			}
		})),
		textModel : new (Backbone.Model.extend({
			defaults : {
				/* Text retrieved from the server */
				text : "",
				/* Offset of the first character in the retrieved text */
				offset : 0,
				/*
				 * Array containing typographical annotations which overlap with the retrieved text
				 */
				typography : [],
				/*
				 * Array containing semantic annotations which overlap with the retrieved text
				 */
				semantics : [],
				/*
				 * Used to cache the HTML version of the text, including marker spans for
				 * annotations etc.
				 */
				cachedHTML : null,
				/*
				 * Structure of the current text, the structure is an array of markers indicating
				 * structure boundary start points.
				 */
				structure : []
			}
		})),
		textSelectionModel : new (Backbone.Model.extend({
			defaults : {
				// The raw text captured by the selection
				text : "",
				// The location within the enclosing text of the
				// selected text.
				start : 0,
				// The location within the enclosing text of the end of
				// the selection (i.e. start + text.length assuming
				// there are no bugs!)
				end : 0
			}
		})),
		// The location model defines the current text and location
		// within that text
		textLocationModel : new (Backbone.Model.extend({
			defaults : {
				// Identifier of the text that should be rendered, if
				// this is null there is no text defined.
				textId : null,
				// The offset within the text which defines the range to
				// render.
				offset : 0,
			}
		}))
	};

	/**
	 * Router defined here, add client-side routes here to handle additional pages and manage
	 * history sensibly.
	 */
	var appRouter = new (Backbone.Router.extend({

		routes : {
			// Routes for pages go here
			'text/:textid/:offset' : 'text',
			'texts' : 'texts',
			'upload' : 'uploadText',
			'user-options' : 'userPrefs',
			'register' : 'register',
			'*actions' : 'defaultActions'
		},

		// Location for listing all available texts
		texts : function() {
			startActivity(new ListTextsActivity(models));
		},

		// Location for reading texts
		text : function(textId, offset) {
			startActivity(new ReadTextActivity(models), {
				textid : textId,
				offset : parseInt(offset),
				router : appRouter
			});
		},

		uploadText : function() {
			startActivity(new TextUploadActivity(models), null);
		},

		userPrefs : function() {
			startActivity(new UserPrefsActivity(models), null);
		},

		register : function() {
			startActivity(new RegisterUserActivity(models), null);
		},

		defaultActions : function() {
			startActivity(new AppActivity(models), null);
		}

	}));

	// Hold the currently running activity, or null if there isn't one.
	var _currentActivity = null;
	// Hold the current URL fragment set by the router, this is used to
	// restore the appropriate URL when an activity vetoes a stop
	// request.
	var _currentFragment = null;

	var _listenersToUnbind = null;

	// Start a new activity, attempting to stop the previously running
	// one if applicable. If the previous activity vetoes shutdown
	// nothing happens.
	var startActivity = function(activity, location) {
		var activityName = (activity.hasOwnProperty('name') ? activity.name : "<unknown activity>");
		if (_currentActivity != null) {
			var currentActivityName = (_currentActivity.hasOwnProperty('name') ? _currentActivity.name
					: "<unknown activity>");
			console.log("Requesting that activity '" + currentActivityName + "' stop on transition to '"
					+ Backbone.history.fragment + "'");
			_currentActivity.stop(function(stopAllowed) {
				if (!stopAllowed) {
					console.log("Activity '" + currentActivityName + "' vetoed stop request!");
					if (_currentFragment != null) {
						appRouter.navigate(_currentFragment, {
							trigger : false,
							replace : false
						});
					}
					// Do nothing, the action vetoed stopping! Here is
					// where we'd reset the displayed URL to that for
					// the previous activity which is still running.
				} else {
					console.log("Activity '" + currentActivityName + "' accepted stop request.");
					// Clean up any model listeners returned by the activity
					if (_listenersToUnbind) {
						_listenersToUnbind.forEach(function(l) {
							console.log("Cleaning up listener registration " + l);
							l.model.unbind(l.event, l.handler);
						});
					}
					// The activity has stopped, done any required
					// cleanup etc. We can set currentActivity to null
					// and call this function again.
					_currentActivity = null;
					// Retrieve the current user from the server, then start the new activity.
					startActivity(activity, location);

				}
			});
		}
		if (_currentActivity == null) {
			_currentActivity = activity;
			_currentFragment = Backbone.history.fragment;
			if (activity.pageTitle) {
				$('#headerTitle').html(activity.pageTitle);
				window.document.title = "Textus - " + activity.pageTitle;
			} else {
				$('#headerTitle').html("No title");
				window.document.title = "Textus Beta";
			}
			if (location != null) {
				console.log("Starting activity '" + activityName + "' with location '" + location + "'");
				_listenersToUnbind = activity.start(location);
			} else {
				console.log("Starting activity '" + activityName + "' with no location.");
				_listenersToUnbind = activity.start();
			}
		}
	};

	return {
		initialize : function() {
			var templates = {
				form : '<form class="bbf-form">{{fieldsets}}</form>',
				fieldset : '<fieldset>{{legend}}{{fields}}</fieldset>',
				field : '<div><label for="{{id}}">{{title}}</label><div class="editor">{{editor}}</div></div>'
			};
			Form.helpers.setTemplates(templates);
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
					}

				}
			}).render();
			models.loginModel.bind("change", function() {
				loginView.render();
			});
			Backbone.history.start();
		}
	};

});