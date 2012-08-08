define([ 'text!templates/reviewTextUploadView.html', 'views/editBibJsonView2', 'textus' ], function(template, Editor,
		textus) {

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);
		},

		render : function() {
			var content = $(this.el);
			content.html(template);
			var subView = new Editor({
				bibJson : {
					title : "Title"
				}
			});
			subView.render();
			console.log(subView);
			$('#tab2', content).append(subView.el);
			$('a[data-toggle="tab"]', this.el).click(function(e) {
				e.preventDefault();
				console.log("Switching tab to " + $(this).attr("href"));
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
			$('#tab1', this.el).html(textus.markupText(text, 0, data.typography, data.semantics));

		}

	});

});