var hash = require('password-hash');
var crypto = require('crypto');

/**
 * Generate a random secret token.
 */
var randomSecret = function() {
	return crypto.randomBytes(48).toString('hex');
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
 * Export the public API for this module. The datastore to use is passed in as an argument when
 * requiring the module and is used to store and retrieve non-volatile per-user information.
 */
module.exports = exports = function(datastore) {

	return {

		/**
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
			console.log("getCurrentUser : user = " + user + ", userKey = " + userKey);
			if (user && userKey && loginSecrets[user] && loginSecrets[user] == userKey) {
				this.getUser(user, callback);
			} else {
				callback(null);
			}
		},

		/**
		 * Create a new user record, assigning a random colour to the user record.
		 * 
		 * @param email
		 *            the email address, used as a unique user identifier
		 * @param password
		 *            the password to use, will be stored as a hash
		 * @param callback
		 *            called with either null if the creation failed or the new user record
		 */
		createUser : function(email, password, callback) {
			var rCol = function() {
				return Math.floor(Math.random() * 256);
			};
			var user = {
				id : email,
				password : hash.generate(password),
				prefs : {
					colour : {
						red : rCol(),
						green : rCol(),
						blue : rCol()
					}
				}
			// colour : "rgba(" + rCol() + "," + rCol() + "," + rCol() + ",0.2)"
			};
			datastore.createUser(user, function(err, newUser) {
				if (err) {
					console.log(err);
					callback(null);
				} else {
					userCache[user.id] = user;
					console.log("Created new user id = "+user.id);
					console.log(user);
					callback(newUser);
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
		 * @param callback
		 *            a function called with either the user record (success) or null (failure)
		 */
		login : function(req, callback) {
			console.log("Login : id = " + req.body.id + ", password = " + req.body.password);
			if (req.body.id && req.body.password) {
				datastore.getUser(req.body.id, function(err, result) {
					if (err || result == null) {
						/* No user found with that id */
						console.log("No such user");
						callback(null);
					} else {
						userCache[result.id] = result;
						/* Check whether the password is correct */
						console.log(result);
						if (hash.verify(req.body.password, result.password)) {
							/* Password verified */
							req.session.user = result.id;
							req.session.userKey = randomSecret();
							loginSecrets[req.session.user] = req.session.userKey;
							console.log("Added properties to session : user = " + result.id + ", userKey = "
									+ req.session.userKey);
							console.log("User found and verified");
							callback(result);
						} else {
							/* Password incorrect */
							console.log("User found but password doesn't match");
							callback(null);
						}
					}
				});
			} else {
				callback(null);
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
		 * @param callback
		 *            called with the new user record, or null if the update failed for some reason
		 */
		updateUserPrefs : function(id, prefs, callback) {
			this.getUser(id, function(user) {
				if (user == null) {
					callback(null);
				}
				for (prop in prefs) {
					user.prefs[prop] = prefs[prop];
				}
				datastore.updateUser(user, function(err, result) {
					if (err) {
						callback(null);
					} else {
						callback(user);
					}
				});
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
				callback(userCache[id]);
			} else {
				datastore.getUser(id, function(err, result) {
					if (err) {
						callback(null);
					} else {
						userCache[result.id] = result;
						callback(result);
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
		}

	};
};