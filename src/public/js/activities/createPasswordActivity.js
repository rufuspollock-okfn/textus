define([ 'textus', 'views/createPasswordView', 'loginClient' ], function(textus, View, login) {
	return function(userId, confirmationKey) {

		this.name = "CreatePasswordActivity";

		this.pageTitle = "Set Password";

		this.start = function() {
			console.log("Create password activity started");
			var view = new View();
			view.render();
			$('#submit-button').click(function() {
				view.clearMessage();
				login.createPassword(userId, confirmationKey, $('#pw1').val(), $('#pw2').val(), function(response) {
					view.showMessage(response);
					if (response.success) {
						window.location.replace("/#account");
					}
				});
				return false;
			});
		};

		this.stop = function(callback) {
			callback(true);
		};
	};
});