/**
 * Wrapper around the remote service methods injected into the express app by login.js on the server
 * side. Handles updating the login model when users log in and out.
 */
define([ 'models' ], function(models) {

	var prefix = "api/";

	var loginClient = {

		/**
		 * Determine whether there is a user logged in, passing the result of the call to the
		 * callback and updating the login model as a side effect.
		 */
		getCurrentUser : function(callback) {
			$.getJSON(prefix + "login/user", function(data) {
				if (data.success) {
					models.loginModel.set({
						loggedIn : true,
						user : data.user,
						init : true
					});
				} else {
					models.loginModel.set({
						loggedIn : false,
						user : null,
						init : true
					});
				}
				if (callback) {
					callback(data);
				}
			});
		},

		/**
		 * Attempt to create a new user with the specified email address. This will also trigger the
		 * sending of the confirmation email.
		 */
		createUser : function(id, callback) {
			$.post(prefix + "login/users", {
				id : id
			}, function(response) {
				if (response.success) {
					loginClient.resetPassword(id, callback);
				} else {
					callback(response);
				}
			});
		},

		/**
		 * Attempt to log in with the supplied user ID and password
		 */
		login : function(id, password, callback) {
			$.post(prefix + "login", {
				id : user,
				password : password
			}, function(response) {
				if (response.success) {
					models.loginModel.set({
						loggedIn : true,
						user : response.user,
						init : true
					});
				} else {
					{
						models.loginModel.set({
							loggedIn : false,
							user : null,
							init : true
						});
					}
				}
				callback(response);
			});
		},

		/**
		 * Respond to a password creation request, on success also logs the user in.
		 * 
		 * @param id
		 *            the user ID
		 * @param confirmationKey
		 *            the confirmation key specified in the password creation request
		 * @param newPassword
		 *            the new password
		 * @param callback
		 *            called with the response from the server
		 */
		createPassword : function(id, confirmationKey, newPassword, callback) {
			$.post(prefix + "login/users/" + encodeURIComponent(id) + "/password", {
				confirmationKey : confirmationKey,
				newPassword : newPassword
			}, function(response) {
				if (response.success) {
					loginClient.login(id, newPassword, callback);
				} else {
					callback(response);
				}
			});
		},

		/**
		 * Reset the password for the specified ID, triggering a confirmation email.
		 */
		resetPassword : function(id, callback) {
			$.getJSON(prefix + "login/users/" + encodeURIComponent(id) + "/reset", function(response) {
				callback(response);
			});
		},

		/**
		 * Log out
		 */
		logout : function(callback) {
			$.post(prefix + "login/logout", function(response) {
				models.loginModel.set({
					loggedIn : false,
					user : null,
					init : true
				});
				window.location.replace("/#");
			});
		}

	};

	return loginClient;

});