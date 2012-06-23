define(
		[ 'jquery', 'underscore', 'backbone', 'form' ],
		function($, _, Backbone, Form) {

			return Backbone.View
					.extend({

						intialize : function() {
							_.bindAll(this);

						},

						render : function() {

							var presenter = this.options.presenter;
							var $l = $('.login-wrapper');
							if (presenter) {
								presenter
										.getCurrentUser(function(user) {
											$l.empty();
											if (user.loggedin) {
												var $i = $("<div class='logged-in'/>");
												$i.append("<div class='textus-label'>User :</div><div class='user-name'>"
														+ user.details.id + "</div>");
												$i.append("<button id='logoutButton'>Log Out</button>");

												$l.append($i);
												$i
														.append("<div class='login-links'><a href='#user-options'>Account options</a></div>");
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
												$l
														.append(form.el, "<button id='loginButton'>Log In</button>",
																"<div class='login-links'><a href='#register'>Register</a></div>");
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