define([ 'jquery', 'underscore', 'backbone', 'form' ], function($, _, Backbone, Form) {

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);

		},

		render : function() {

			var presenter = this.options.presenter;
			var $l = $('.login-wrapper');
			if (presenter) {
				presenter.getCurrentUser(function(user) {
					$l.empty();
					if (user.loggedin) {
						var $i = $("<div class='logged-in'/>");
						$i
								.append("<div class='label'>User :</div><div class='user-name'>" + user.details.user
										+ "</div>");
						$i.append("<button id='logoutButton'>Log Out</button>");
						$l.append($i);
						$('#logoutButton').bind("click", function() {
							presenter.logout();
						});
					} else {
						var form = new Form({
							data : {
								user : "",
								password : ""
							},
							schema : {
								user : {
									type : 'Text'
								},
								password : {
									type : 'Password'
								}
							}
						}).render();
						$l.append(form.el, "<button id='loginButton'>Log In</button>");
						$('#loginButton').bind("click", function() {
							presenter.login(form.getValue().user, form.getValue().password);
						});
					}
				});
			}
			return this;
		}

	});

});