define([ 'text!templates/testView.html', 'views/editBibJsonView2', 'textus' ],
		function(layoutTemplate, Editor, textus) {

			var modal = function(position) {
				return {
					constructor : function(container, header, closeModal) {
						container.html("<p>This is the content of the modal dialogue</p>");
						header.html("<div><a href='#' class='btn btn-success'>A button</a>"
								+ "<h4 style='display:inline; padding-left:10px'>This is the header</h4></div>");
					},
					beforeClose : function() {
						console.log("beforeClose called");
						return true;
					},
					position : position
				};
			};

			return Backbone.View.extend({

				intialize : function() {
					_.bindAll(this);
				},

				render : function() {
					$('.main').html(layoutTemplate);
					var editor = new Editor({
						listener : function() {
							$('#jsonText').html(JSON.stringify(editor.getBibJson(), null, " "));
						}
					});
					editor.render();
					$('#editorTest').html(editor.el);
					$('#jsonText').html(JSON.stringify(editor.getBibJson(), null, " "));
					$('#openModalLeft').click(function(event) {
						textus.showModal(modal('left'), event);
						return false;
					});
					$('#openModalRight').click(function(event) {
						textus.showModal(modal('right'), event);
						return false;
					});
					$('#openModalTop').click(function(event) {
						textus.showModal(modal('top'), event);
						return false;
					});
					$('#openModalBottom').click(function(event) {
						textus.showModal(modal('bottom'), event);
						return false;
					});
					$('#openModalOver').click(function(event) {
						textus.showModal(modal('over'), event);
						return false;
					});
					$('#openModalNoEvent').click(function(event) {
						textus.showModal(modal(null));
						return false;
					});
					$('#openModalNoPosition').click(function(event) {
						textus.showModal(modal(null), event);
						return false;
					});
					return this;
				}

			});

		});