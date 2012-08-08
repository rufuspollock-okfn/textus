define([ 'text!templates/appView.html', 'views/editBibJsonView2' ], function(layoutTemplate, Editor) {

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);

		},

		render : function() {
			$('.main').html(layoutTemplate);
			var editor = new Editor();
			editor.render();
			$('#editorTest').html(editor.el);
			$('#showObject').click(function() {
				console.log(editor.getBibJson());
				return false;
			});
			return this;
		}

	});

});