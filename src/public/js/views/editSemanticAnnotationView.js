/**
 * UI Component to edit or create a single semantic annotation payload. Currently just supports free
 * text annotations.
 */
define([ 'jquery', 'underscore', 'backbone', 'text!templates/editSemanticAnnotationView.html', 'form' ], function($, _,
		Backbone, layoutTemplate, Form) {

	/**
	 * Holds schemas used for backbone-forms and keyed on the 'type' field of the semantic
	 * annotations. Provides edit support for the various kinds of semantic annotation payload.
	 */
	var schemas = {
		"textus:comment" : {
			"text" : "TextArea"
		},
		"textus:bibjson" : {
		// TODO - fix BibJSON schema here
		}
	};

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);

		},

		render : function() {

			this.$el.html(layoutTemplate);
			var presenter = this.options.presenter;
			var annotation = this.options.annotation;
			var creating = (annotation.payload == null);
			if (creating) {
				this.$el.find('#annotationEditorTitle').html("Create new annotation");
			} else {
				this.$el.find('#annotationEditorTitle').html("Edit annotation");
			}
			console.log(this.options);
			if (schemas[annotation.type]) {
				var form = new Form({
					data : annotation.payload,
					schema : schemas[annotation.type]
				});
				this.$el.append(form.render().el);
				this.$el.append("<button id='submitAnnotation'>" + (creating ? "Create" : "Update") + "</button>");
				this.$el.find('#submitAnnotation').bind("click", function() {
					console.log(form.getValue());
					presenter.storeAnnotation({
						type : annotation.type,
						payload : form.getValue()
					});
				});
			} else {
				console.log("Unable to find edit schema for annotation " + annotation);
			}
			return this;
		}

	});

});
