define([ 'text!templates/reviewTextUploadView.html', 'views/editBibJsonView', 'textus' ], function(template,
		EditBibJsonView, textus) {

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);

		},

		render : function() {
			$(this.el).html(template);
			var subView = new EditBibJsonView().render();
			$('#reviewTabBibJsonEditor', this.el).append(subView.el);
			$('#reviewTab a', this.el).click(function(e) {
				e.preventDefault();
				$(this).tab('show');
			});
			this.getBibJson = function() {
				return subView.getBibJson();
			};
			return this;
		},

		setText : function(data) {
			var text = data.text.sort(function(a, b) {
				return a.sequence - b.sequence;
			}).map(function(struct) {
				return struct.text;
			}).join("");
			$('#reviewTabText', this.el).html(textus.markupText(text, 0, data.typography, data.semantics));
		}
	});

});