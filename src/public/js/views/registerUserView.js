define([ 'jquery', 'underscore', 'backbone', 'form', 'text!templates/registerUserView.html' ], function($, _, Backbone,
		Form, template) {

	var detailsSchema = {
		"name" : {
			type : "Text",
			title : "Display name"
		}
	};

	var coreSchema = {
		"email" : "Text",
		"password" : "Password"
	};

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);
		},

		render : function() {
			console.log("Rendering register user view");
			$(this.el).html(template);
			var presenter = this.options.presenter;
			var coreForm = new Form({
				schema : coreSchema
			});
			var detailsForm = new Form({
				schema : detailsSchema
			});

			this.$el.find('#core').html(coreForm.render().el);
			this.$el.find('#details').html(detailsForm.render().el);
			this.$el.find('#create-user').bind(
					"click",
					function() {
						presenter.createAndLogIn(coreForm.getValue().email, coreForm.getValue().password, detailsForm
								.getValue());
					});
			return this;
		}

	});

});