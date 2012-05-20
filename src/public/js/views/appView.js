define([ 'jquery', 'underscore', 'backbone', 'text!templates/appView.html', 'form' ], function($, _, Backbone,
		layoutTemplate, Form) {

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);

		},

		render : function() {
			$('.main').html(layoutTemplate);
			var presenter = this.presenter = this.options.presenter;
			console.log(this.options);
			console.log(presenter);
			if (presenter) {
				console.log("Presenter found");
				presenter.getCurrentUser(function(user) {
					console.log("Presenter called, result was " + user);
					if (user.loggedin) {
						$('.login').html("Logged in...");
					} else {
						console.log(Form);
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
						console.log(form);
						$('.login').append(form.el);
					}
				});
			}
			return this;
		}

	});

});