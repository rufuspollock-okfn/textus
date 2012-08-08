define([ 'text!templates/testView.html', 'views/editBibJsonView2' ], function(layoutTemplate, Editor) {

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
			return this;
		}

	});

});