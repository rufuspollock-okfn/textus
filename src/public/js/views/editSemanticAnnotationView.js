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
				"text" : "TextArea"
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
					"<a href='#' class='btn btn-success' id='submitAnnotation'>" + (creating ? "Create" : "Update")
							+ "</a>");
			el.find('#submitAnnotation').bind("click", function() {
				console.log(form.getValue());
				presenter.storeAnnotation({
					type : annotation.type,
					payload : form.getValue()
				});
				return false;
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
			console.log(this.options);
			populateAnnotationEditor(this.$el, annotation, presenter);
			return this;
		}
	});

});
