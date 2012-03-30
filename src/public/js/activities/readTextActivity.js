define([ 'jquery', 'underscore', 'backbone', 'textus', 'views/textView' ],
		function($, _, Backbone, textus, TextView) {
			return function(models) {

				this.name = "ReadTextActivity";

				this.start = function(location) {
					// Create a new textView
					var textView = new TextView({
						textModel : models.textModel,
						presenter : {
							// Called when text is selected
							handleTextSelection : function(start, end, text) {
								models.textSelectionModel.set({
									start : start,
									end : end,
									text : text
								});
							}
						},
						textLocationModel : models.textLocationModel
					});
					// Set up a listener on selection events on the text
					// selection model
					var s = models.textSelectionModel;
					s.bind("change", function(event) {
						if (s.get("text") != "") {
							alert("Text selected '" + s.get("text")
									+ "' character range [" + s.get("start")
									+ "," + s.get("end") + "]");
						}
					});
					// Render it to the DOM, it'll be empty at this point
					// but this will set up the appropriate window
					// structure.
					textView.render();
					// Retrieve the text, this will be replaced by a bound
					// setLocation method...
					$.getJSON("mock-data/alice-in-wonderland.txt.json",
							function(data) {
								models.textModel.set({
									text : data.text,
									offset : data.offset,
									typography : data.typography,
									semantics : data.semantics
								});
								textView.render();
							});
				};

				this.stop = function(callback) {
					// Unbind the change listener on the text selection model
					models.textSelectionModel.unbind("change");
					callback(true);
				};
			};
		});