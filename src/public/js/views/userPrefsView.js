define([ 'text!templates/userPrefsView.html', 'gravatar', 'models' ], function(template, gravatar, models) {

	var prefs = {};

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);
		},

		render : function() {
			console.log("Rendering user preferences view");
			$(this.el).html(template);
			$('#gravatar', this.el).attr("src", gravatar.gravatarURL(80));
			return this;
		},

		afterDisplay : function() {
			var user = models.loginModel.get("user");
			var presenter = this.options.presenter;
			console.log(user);
			$('#annotationColourPicker', this.el).colorPicker({
				format : 'rgb',
				size : 100,
				colorChange : function(e, ui) {
					user.prefs.colour = {
						red : ui.red,
						green : ui.green,
						blue : ui.blue
					};
				}
			});
//			$('#annotationColourPicker', this.el)
//					.colorPicker(
//							'setColor',
//							'rgb(' + user.prefs.colour.red + ',' + user.prefs.colour.green + ','
//									+ user.prefs.colour.blue + ')');
			$('#saveChanges').click(function() {
				presenter.updatePrefs();
			});
		},

		getPrefs : function() {
			prefs.displayName = $('#displayName', this.el).val();
			return prefs;
		},

		setPrefs : function(newPrefs) {
			prefs = newPrefs;
			console.log("Setting prefs",newPrefs);
			$('#annotationColourPicker', this.el).colorPicker('setColor',
					'rgb(' + prefs.colour.red + ',' + prefs.colour.green + ',' + prefs.colour.blue + ')');
			$('#displayName', this.el).val(prefs.displayName);
		}

	});

});

//
// $.post("api/semantics/" + annotation.id, annotation, function(response) {
// if (response.success) {
// presenter.requestTextFill();
// closeModal();
// } else {
// window.alert(respose.message);
// closeModal();
// }
// });
