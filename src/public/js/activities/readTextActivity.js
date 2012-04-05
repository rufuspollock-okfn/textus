define([ 'jquery', 'underscore', 'backbone', 'textus', 'views/textView' ],
		function($, _, Backbone, textus, TextView) {

			return function(models) {

				var presenter = {

					/**
					 * Called by the view when a selection of text has been
					 * made, used to set the text selection model.
					 * 
					 * @param start
					 *            The absolute index of the first character in
					 *            the selected text.
					 * @param end
					 *            The absolute index of the last character in
					 *            the selected text, should be start +
					 *            text.length assuming all's working.
					 * @param text
					 *            The text of the selection.
					 */
					handleTextSelection : function(start, end, text) {
						models.textSelectionModel.set({
							start : start,
							end : end,
							text : text
						});
					},

					/**
					 * Called by the view when it needs to retrieve more text
					 * and annotations to render, typically as a result of the
					 * location changing or the view size being modified.
					 * 
					 * @param offset
					 *            Absolute index of the first character of text
					 *            to retrieve
					 * @param length
					 *            Length of desired text
					 * @param callback
					 *            A callback function called with the retrieved
					 *            data in the form {text:string, offset:int,
					 *            typography:[], semantics:[]}
					 * 
					 * @TODO - Currently a dummy implementation, should just
					 *       call a method on the server but for now this makes
					 *       testing without the server running much easier.
					 */
					retrieveText : function(offset, length, callback) {
						console.log("Retrieving "+length+" characters of text from "+offset);
						$.getJSON("api/text/textid/" + offset + "/"
								+ (offset + length), function(data) {
							callback(data);
						});
					}

				};

				this.name = "ReadTextActivity";

				this.start = function(location) {

					// Create a new textView
					var textView = new TextView({
						textModel : models.textModel,
						presenter : presenter,
						textLocationModel : models.textLocationModel,
						el : $('.main')
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
					textView.render();
					// Render it to the DOM, it'll be empty at this point
					// but this will set up the appropriate window
					// structure.
					textView.setTextLocation(location.offset);
				};

				this.stop = function(callback) {
					// Unbind the change listener on the text selection model
					models.textSelectionModel.unbind("change");
					callback(true);
				};
			};
		});