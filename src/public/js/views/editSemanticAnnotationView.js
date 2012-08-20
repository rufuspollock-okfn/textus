/**
 * UI Component to edit or create a single semantic annotation payload. Currently just supports free
 * text annotations.
 */
define([ 'text!templates/editSemanticAnnotationView.html', 'views/annotationTypes' ], function(layoutTemplate,
		annotationTypes) {

	/**
	 * Holds schemas used for backbone-forms and keyed on the 'type' field of the semantic
	 * annotations. Provides edit support for the various kinds of semantic annotation payload.
	 */
	var schemas = annotationTypes.schemas;

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
			$('#annotationEditor', el).append(form.render().el);

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

	function createEditor(type, el, value) {
		el.empty();
		console.log(type);
		var form = new Form({
			data : (value ? value.payload : {}),
			schema : schemas[type].schema
		});
		el.append(form.render().el);
		return form;
	}

	return Backbone.View
			.extend({

				intialize : function() {
					_.bindAll(this);
				},

				render : function() {
					this.$el.html(layoutTemplate);
					var presenter = this.options.presenter;
					var annotation = this.options.annotation;
					var typeSelect = $('#typeSelect', this.$el);
					var editorPanel = $('#annotationEditor', this.$el);
					var form;
					function updatedAnnotation(visibility) {
						return {
							user : annotation.user,
							type : annotation.type,
							id : annotation.id,
							visibility : visibility,
							payload : form.getValue()
						};
					}
					if (annotation != null) {
						/* Existing annotation */
						form = createEditor(annotation.type, editorPanel, annotation);
						$('.creating-annotation', this.$el).hide();

						$('#saveAsPrivate', this.$el).click(function() {
							presenter.updateAnnotation(updatedAnnotation('private'));
							return false;
						});
						$('#saveAsProvisional', this.$el).click(function() {
							presenter.updateAnnotation(updatedAnnotation('provisional'));
							return false;
						});
						$('#saveAsFinal', this.$el).click(function() {
							presenter.updateAnnotation(updatedAnnotation('final'));
							return false;
						});
						$('#delete', this.$el).click(function() {
							presenter.updateAnnotation(updatedAnnotation('delete'));
							return false;
						});
					} else {
						/* Completely new annotation */
						$('.editing-annotation', this.$el).hide();
						for (schemaKey in schemas) {
							if (schemas.hasOwnProperty(schemaKey)) {
								typeSelect.append('<option value="' + schemaKey + '">' + schemas[schemaKey].name
										+ '</option>');
							}
						}
						typeSelect.change(function() {
							form = createEditor(typeSelect.val(), editorPanel);
						});
						form = createEditor(typeSelect.val(), editorPanel);
						$('#create', this.$el).click(function() {
							var newAnnotation = {
								payload : form.getValue(),
								type : typeSelect.val(),
								visibility : 'private'
							};
							console.log(newAnnotation);
							presenter.createAnnotation(newAnnotation);
							return false;
						});
					}

					return this;
				}
			});

});
