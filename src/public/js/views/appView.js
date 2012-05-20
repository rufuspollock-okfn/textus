define([ 'jquery', 'underscore', 'backbone', 'text!templates/appView.html', 'form' ], function($, _, Backbone,
		layoutTemplate, Form) {

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);

		},

		render : function() {
			$('.main').html(layoutTemplate);
			var presenter = this.options.presenter;
			var $l = $('.login');
			if (presenter) {
				presenter.getCurrentUser(function(user) {
					$l.empty();
					if (user.loggedin) {
						$l.append("<div>Logged in as " + user.details.user + "</div>");
						$l.append("<button id='logoutButton'>Log Out</button>");
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
								user : 'Text',
								password : 'Password'

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