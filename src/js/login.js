var hash = require('password-hash');
var crypto = require('crypto');
var Mailgun = require('mailgun').Mailgun;

/**
 * Generate a random secret token.
 */
var randomSecret = function() {
	return crypto.randomBytes(12).toString('hex');
};

/**
 * Track the secret tokens allocated to each user, these are stored in the session along with the
 * user id and used to validate that the request is legitimate.
 */
var loginSecrets = {};

/**
 * Simple in-memory cache of all known users, populated on creation and maintained whenever a user
 * is created. Used when a rapid lookup of user information is required.
 */
var userCache = {};

/**
 * Default user preferences, currently creates a random colour property.
 */
var defaultPrefs = function() {
	var rCol = function() {
		return Math.floor(Math.random() * 256);
	};
	return {
		colour : {
			red : rCol(),
			green : rCol(),
			blue : rCol()
		}
	};
};

/**
 * Build a new object with the publicly interesting subset of the user properties, specifically the
 * ID, confirmation status and preferences. The password is not exposed outside of this module.
 */
var sanitizeUser = function(user) {
	if (user === null) {
		return null;
	} else {
		return {
			id : user.id,
			confirmed : user.confirmed,
			prefs : user.prefs
		};
	}
};

/**
 * Convenience method to pass through a callback response from the API to the routes added by the
 * addRoutes function
 */
var sanitizeCallback = function(response) {
	return {
		success : response.success,
		user : sanitizeUser(response.user),
		message : response.message
	};
};

/**
 * Generate a new user response object. This is the object passed to all callback functions in this
 * API
 * 
 * @param user
 *            the user record corresponding to the newly logged-in, created or updated user
 * @param success
 *            boolean, true if the call succeeded, false otherwise
 * @param message
 *            may be the empty string (or null, which is translated to the empty string),
 *            description of failure or success. If the success property is false this must be
 *            specified.
 */
var buildCallback = function(user, success, message) {
	if (message === null) {
		message = "";
	}
	return {
		success : success,
		user : user,
		message : message
	};
};

/**
 * Send a confirmation email for the specified user, using settings in the supplied textus
 * configuration object.
 */
var sendConfirmationEmail = function(user, conf, callback) {
	var mg = new Mailgun(conf.mailgun.key);
	var confirmUrl = conf.textus.base + "#password/" + encodeURIComponent(user.id) + "/"
			+ encodeURIComponent(user.confirmationKey);
	var text = "Dear textus user,\n\nSomeone (hopefully you) has requested a new password or a "
			+ "password reset for a textus server. If this wasn't you please ignore this message, "
			+ "otherwise click (or cut and paste) the following link to proceed :\n\n " + confirmUrl;
	mg.sendText(conf.mailgun.from, [ user.id ], "Create a new TEXTUS password", text, function(err) {
		if (err) {
			callback(buildCallback(null, false, "Unable to send confirmation email for '" + user.id + "' : " + err));
		} else {
			callback(buildCallback(user, true, "Sent confirmation email for '" + user.id + "'."));
		}
	});
};

/**
 * Export the public API for this module. The datastore to use is passed in as an argument when
 * requiring the module and is used to store and retrieve non-volatile per-user information.
 */
module.exports = exports = function(datastore, conf) {

	var loginService = {

		/**
		 * Used in the express.js handler chain on methods which require a logged in user.
		 * <p>
		 * Check whether the current session is valid based on the session.user and session.userKey
		 * properties, either passing control to the next function in the handler chain if okay or
		 * responding with a non-authorised response if not.
		 * 
		 * @param req
		 *            HTTP request object
		 * @param res
		 *            HTTP response object
		 * @param next
		 *            next function in the handler chain, called on successful session validation.
		 */
		checkLogin : function(req, res, next) {
			var valid = false;
			if (req.session.user && req.session.userKey && loginSecrets[req.session.user]
					&& loginSecrets[req.session.user] == req.session.userKey) {
				valid = true;
			}
			if (valid) {
				next();
			} else {
				res.send('Not authorized', 401);
			}
		},

		/**
		 * Retrieve the current logged in user, or null if there is no user logged in.
		 * 
		 * @param req
		 *            the HTTP request object, used to interrogate the cookies set by the login
		 *            system
		 * @param callback
		 *            called with the user object or null if there is no logged in user.
		 */
		getCurrentUser : function(req, callback) {
			var user = req.session.user;
			var userKey = req.session.userKey;
			if (user && userKey && loginSecrets[user] && loginSecrets[user] == userKey) {
				this.getUser(user, callback);
			} else {
				callback(buildCallback(null, false, "No user logged in"));
			}
		},

		/**
		 * Create a new user record, assigning a random colour to the user record.
		 * 
		 * @param email
		 *            the email address, used as a unique user identifier
		 * @param callback
		 *            called with either null if the creation failed or the new user record
		 */
		createUser : function(email, callback) {
			/*
			 * Create a new user object, including a randomly assigned strong password. This is
			 * never intended to be used to log in, instead the user will be sent an email then
			 * redirected to a confirmation page where he or she can enter a new password.
			 */
			var user = {
				id : email,
				password : hash.generate(randomSecret()),
				prefs : defaultPrefs(),
				confirmationKey : randomSecret(),
				confirmed : false
			};
			datastore.createUser(user, function(err, newUser) {
				if (err) {
					console.log(err);
					if (err.indexOf("DocumentAlreadyExistsException") > -1) {
						callback.buildCallback(null, false, "User '" + email
								+ "' already exists in this textus instance.");
					} else {
						callback(buildCallback(null, false, "Unable to create user : " + err));
					}
				} else {
					userCache[user.id] = user;
					callback(buildCallback(newUser, true, "New user created with id : '" + email + "'."));
				}
			});
		},

		/**
		 * Set the password for a particular user, the user record must have the confirmation key
		 * defined and this must be equal to the confirmation key specified in this call's
		 * arguments.
		 * 
		 * @param email
		 *            the email address of the user to update
		 * @param confirmationKey
		 *            a confirmation key which must be equal to that in the user record for this
		 *            email address
		 * @param newPassword
		 *            the new password to store
		 * @param callback
		 */
		createUserPassword : function(email, confirmationKey, newPassword, callback) {
			/*
			 * Retrieve the user record for this email, check that the status and confirmation key
			 * match
			 */
			this.getUser(email, function(result) {
				if (result.success) {
					if (!result.user.confirmed && result.user.confirmationKey
							&& result.user.confirmationKey == confirmationKey) {
						result.user.confirmed = true;
						delete result.user.confirmationKey;
						result.user.password = hash.generate(newPassword);
						datastore
								.createOrUpdateUser(result.user,
										function(err, user) {
											if (err) {
												callback(buildCallback(null, false, "Error when updating user '"
														+ email + "' : " + err));
											} else {
												userCache[user.id] = user;
												callback(buildCallback(user, true, "Updated user record for '" + email
														+ "'."));
											}
										});
					} else {
						callback(buildCallback(null, false, "User with id '" + email
								+ "' is not in the correct state for password creation, "
								+ "either is already confirmed or confirmation key doesn't match!"));
					}
				} else {
					/*
					 * If failed then pass the result object containing the failure message back to
					 * the original callback function
					 */
					callback(result);
				}
			});
		},

		/**
		 * Request a password reset, triggering a change of confirmation status to false,
		 * randomizing the stored password and generating a random confirmation key. A confirmation
		 * email is then generated and sent to the appropriate address.
		 * 
		 * @param email
		 * @param callback
		 * @returns
		 */
		requestPasswordReset : function(email, callback) {
			this.getUser(email, function(result) {
				if (result.success) {
					result.user.password = hash.generate(randomSecret());
					result.user.confirmationKey = randomSecret();
					result.user.confirmed = false;
					datastore.createOrUpdateUser(result.user, function(err, user) {
						if (err) {
							callback(buildCallback(null, false, "Error when updating user '" + email + "' : " + err));
						} else {
							userCache[user.id] = user;
							sendConfirmationEmail(user, conf, callback);
						}
					});
				} else {
					callback(result);
				}
			});
		},

		/**
		 * Attempt to log in, checking the supplied req.user and req.password against the data-store
		 * and calling the callback with an appropriate response (the user record for a successful
		 * login and null otherwise). The appropriate fields will be set in the req.session.
		 * 
		 * @param req
		 *            the HTTP request object
		 */
		login : function(req, callback) {
			loginService.logout(req);
			if (req.body.id && req.body.password) {
				datastore.getUser(req.body.id, function(err, result) {
					if (err || result == null) {
						/* No user found with that id */
						callback(buildCallback(null, false, "User '" + req.body.id + "' not recognized."));
					} else {
						userCache[result.id] = result;
						/* Check that the user is confirmed before checking the password */
						if (result.confirmed) {
							/* Check whether the password is correct */
							if (hash.verify(req.body.password, result.password)) {
								/* Password verified */
								req.session.user = result.id;
								req.session.userKey = randomSecret();
								loginSecrets[req.session.user] = req.session.userKey;
								callback(buildCallback(result, true, "Logged in as '" + req.body.id + "'."));
							} else {
								/* Password incorrect */
								callback(buildCallback(null, false, "User with id '" + req.body.id
										+ "' found but password doesn't match"));
							}
						} else {
							callback(buildCallback(null, false, "Can't log into a user account '" + req.body.id
									+ "' which isn't confirmed."));
						}
					}
				});
			} else {
				callback(buildCallback(null, false, "HTTP request didn't specify a userID and password!"));
			}
		},

		/**
		 * Update the prefs part of the specified user.
		 * 
		 * @param id
		 *            user ID to update
		 * @param prefs
		 *            new prefs content to be merged with the existing preferences, overwriting any
		 *            existing keys
		 */
		updateUserPrefs : function(id, prefs, callback) {
			this.getUser(id, function(user) {
				if (user == null) {
					callback(buildCallback(null, false, "No user specified for prefs update!"));
				} else {
					for (prop in prefs) {
						user.prefs[prop] = prefs[prop];
					}
					datastore.createOrUpdateUser(user, function(err, result) {
						if (err) {
							callback(buildCallback(null, false, "Error when updating user '" + id + "' : " + err));
						} else {
							userCache[user.id] = user;
							callback(buildCallback(user, true, "Updated user record for '" + id + "'."));
						}
					});
				}
			});
		},

		/**
		 * Retrieve a user record by user id, using the cache where possible.
		 * 
		 * @param id
		 *            the user ID to retrieve
		 * @param callback
		 *            function called with null if no user is found or the user record otherwise.
		 */
		getUser : function(id, callback) {
			if (userCache[id]) {
				callback(buildCallback(userCache[id], true, "Retrieved user '" + id + "' from cache."));
			} else {
				datastore.getUser(id, function(err, result) {
					if (err) {
						callback(buildCallback(null, false, "Failed to retrieve user '" + id + "' : " + err));
					} else {
						userCache[result.id] = result;
						callback(buildCallback(result, true, "Retrieved user '" + id + "'."));
					}
				});
			}
		},

		/**
		 * Logout, clearing the user and userKey from the session and deleting the association
		 * between the two in the secret store.
		 * 
		 * @param req
		 *            HTTP request object
		 */
		logout : function(req) {
			if (req.session.user) {
				delete loginSecrets[req.session.user];
				delete req.session.user;
				delete req.session.userKey;
			}
		},

		/**
		 * Add login related routes to the web application
		 * 
		 * @param app
		 *            an application created in express.js to which login utility routes should be
		 *            added.
		 * @param prefix
		 *            the path used as a prefix for all login related functionality, i.e.
		 *            '/api/login/'
		 */
		addRoutes : function(app, prefix) {

			if (prefix === null) {
				prefix = "/api";
			}

			if (prefix[prefix.length - 1] != "/") {
				prefix = prefix + "/";
			}

			/**
			 * POST to log into the server
			 */
			app.post(prefix + "login", function(req, res) {
				loginService.login(req, function(result) {
					res.json(sanitizeCallback(result));
				});
			});

			/**
			 * POST to create a new user, specifying the ID as a body parameter
			 * {id='someone@somewhere'}
			 */
			app.post(prefix + "login/users", function(req, res) {
				loginService.createUser(req.body.id, function(result) {
					res.json(sanitizeCallback(result));
				});
			});

			/**
			 * GET to request verification of a new user password, sending a confirmation email with
			 * a link to the password reset page
			 */
			app.get(prefix + "login/users/:email/reset", function(req, res) {
				if (!conf.textus.base) {
					var protocol = "http";
					if (req.header('X-Forwarded-Protocol') == "https") {
						protocol = "https";
					}
					conf.textus.base = protocol + "://" + req.header("host") + "/";
				}
				loginService.requestPasswordReset(decodeURIComponent(req.params.email), function(response) {
					res.json(sanitizeCallback(response));
				});
			});

			/**
			 * POST to log out of any current active session
			 */
			app.post(prefix + "login/logout", function(req, res) {
				loginService.logout(req);
				res.json(buildCallback(null, true, "Logged Out"));
			});

			/**
			 * GET request for current user, returns {login:BOOLEAN, user:STRING}, where user is
			 * absent if there is no logged in user.
			 */
			app.get(prefix + "login/user", function(req, res) {
				loginService.getCurrentUser(req, function(result) {
					res.json(sanitizeCallback(result));
				});
			});

			app.post(prefix + "login/users/:id/password", function(req, res) {
				var id = decodeURIComponent(req.params.id);
				loginService.createUserPassword(id, req.body.confirmationKey, req.body.newPassword, function(response) {
					res.json(sanitizeCallback(response));
				});
			});

		}
	};

	return loginService;

};