define([ 'text!templates/reviewTextUploadView.html', 'views/editBibJsonView2', 'textus' ], function(template, Editor,
		textus) {

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);
		},

		render : function() {
			var content = $(this.el);
			content.html(template);
			$('a[data-toggle="tab"]', this.el).click(function(e) {
				e.preventDefault();
				$(this).tab('show');
			});
			return this;
		},

		setText : function(data) {
			var text = data.text.sort(function(a, b) {
				return a.sequence - b.sequence;
			}).map(function(struct) {
				return struct.text;
			}).join("");
			$('#tab1', this.el).html(textus.markupText(text, 0, data.typography, data.semantics));

		},

		getTitle : function() {
			return $('#uploadedTitle', this.el).val();
		}

	});

});