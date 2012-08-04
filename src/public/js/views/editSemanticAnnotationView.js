/**
 * UI Component to edit or create a single semantic annotation payload. Currently just supports free
 * text annotations.
 */
define([ 'text!templates/editSemanticAnnotationView.html' ], function(layoutTemplate) {

	/**
	 * Holds schemas used for backbone-forms and keyed on the 'type' field of the semantic
	 * annotations. Provides edit support for the various kinds of semantic annotation payload.
	 */
	var schemas = {
		"textus:comment" : {
			name : "Comment",
			schema : {
				"text" : "TextArea",
				"anotherText" : "Text"
			}
		},
		"textus:bibjson" : {
			name : "BibJSON",
			schema : {
			// TODO - fix BibJSON schema here
			}
		}
	};

	/**
	 * Populate the annotation editor from a given annotation.type, i.e. "textus:comment".
	 */
	var populateAnnotationEditor = function(el, annotation, presenter) {
		if (schemas[annotation.type]) {
			var creating = (annotation.payload == null);
			var form = new Form({
				data : annotation.payload,
				schema : schemas[annotation.type].schema
			});
			el.find('#annotationEditor').append(form.render().el);
			el.find('#annotationEditor').append(
					"<button id='submitAnnotation'>" + (creating ? "Create" : "Update") + "</button>");
			el.find('#submitAnnotation').bind("click", function() {
				console.log(form.getValue());
				presenter.storeAnnotation({
					type : annotation.type,
					payload : form.getValue()
				});
			});
		} else {
			console.log("Unable to find edit schema for annotation " + annotation);
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
			populateAnnotationEditor(this.$el, annotation, presenter);
			return this;
		},

		giveFocus : function() {
			this.$el.find('input')[0].focus();
		}

	});

});
