/**
 * View used to manipulate the metadata for a text, including the ownership of it and the
 * bibliographic metadata and indexing information.
 */
define(
		[ 'text!templates/editTextMetadataView.html', 'textus', 'views/structureMarkerEditorView' ],
		function(template, textus, StructureMarkerEditorView) {

			/* Used to write back metadata to the data store */
			var presenter = null;

			var state = {
				title : "",
				markers : {},
				owners : []
			};

			var showEditor = function(offset, event) {
				var editor = new StructureMarkerEditorView({
					presenter : {}
				});
				editor.render();
				if (state.markers["marker" + offset]) {
					editor.setValue(state.markers["marker" + offset]);
				} else {
					editor.setValue({
						label : "",
						indexLevel : -1,
						discoverable : false,
						bibJson : {}
					});
				}
				textus
						.showModal(
								{
									constructor : function(container, header, closeModal) {
										container.append(editor.el);
										header
												.html("<div style='height: 30px; line-height: 30px'>"
														+ "<a href='#' id='saveMarkerButton' class='btn btn-success pull-right'>Save</a>"
														+ "<a href='#' id='rejectMarkerButton' class='btn btn-warning pull-right' style='margin-right:10px'>Cancel</a>"
														+ "<a href='#' id='deleteMarkerButton' class='btn btn-danger pull-right' style='margin-right:10px'>Delete</a>"
														+ "<h4 style='display:inline; padding-left:10px'>Editing marker at offset = "
														+ offset + "</h4></div>");
										$('#rejectMarkerButton', header).click(function() {
											closeModal();
											return false;
										});

										$('#saveMarkerButton', header).click(function() {
											state.markers["marker" + offset] = editor.getValue();
											updateFromState();
											closeModal();
											return false;
										});
										if (!state.markers["marker" + offset]) {
											$('#deleteMarkerButton', header).hide();
										} else {
											$('#deleteMarkerButton', header).click(function() {
												delete state.markers["marker" + offset];
												updateFromState();
												closeModal();
												return false;
											});
										}
									},
									beforeClose : function() {
										return true;
									},
									position : 'right'
								}, event);

			};

			var updateFromState = function() {
				$('#textPanel>a[offset]').each(
						function() {
							var offset = $(this).attr('offset');
							$(this).removeClass('btn-info').removeClass('btn-primary').removeClass('btn-success')
									.removeClass('btn-warning');
							if (state.markers["marker" + offset]) {
								var marker = state.markers["marker" + offset];
								if (marker.discoverable === true) {
									$(this).addClass('btn-success');
								} else if (marker.indexLevel > -1) {
									$(this).addClass('btn-info');
								} else {
									$(this).addClass('btn-warning');
								}
							}
						});
			};

			return Backbone.View.extend({

				/**
				 * Initialise the view
				 */
				initialize : function() {
					_.bindAll(this);
					presenter = this.options.presenter;
				},

				/**
				 * Renders the view to its element and returns the view
				 */
				render : function() {
					/* Load the layout */
					$(this.el).html(template);
					$('#saveMetadataButton', this.el).click(function() {
						presenter.saveMetadata(state);
						return false;
					});
					$('#resetMetadataButton', this.el).click(function() {
						presenter.resetMetadata();
						return false;
					});
					return this;
				},

				/**
				 * Call to set the text and typographical annotations, this must be called with the
				 * entire text and will set the contents of the scrollable panel containing the text
				 * preview.
				 */
				setText : function(text, typography) {
					$('#textPanel', this.el).html(textus.markupText(text, 0, typography, []));
					items = $('#textPanel>[offset]');
					items.before(function() {
						return "<a class='btn' style='float: left; width: 20px; height: 20px; padding: 0px' offset='"
								+ $(this).attr('offset') + "'></a>";
					});
					items.css('padding-left', '30px');
					items.hover(function() {
						$(this).css('background-color', 'whiteSmoke');
					}, function() {
						$(this).css('background-color', 'transparent');
					});
					$('#textPanel>a[offset]').click(function(event) {
						var offset = $(this).attr('offset');
						showEditor(offset, event);
					});
				},

				/**
				 * Call to set the metadata object for the view, consisting of ownership information
				 * and structural markers.
				 */
				setMetadata : function(metadata) {
					state = metadata;
					updateFromState();
				},

				/**
				 * Retrieve the current state of the metadata model under editing
				 */
				getMetadata : function() {
					return state;
				}

			});

		});