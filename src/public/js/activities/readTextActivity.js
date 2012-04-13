define([ 'jquery', 'underscore', 'backbone', 'textus', 'views/textView' ], function($, _, Backbone, textus, TextView) {

	return function(models) {

		/**
		 * Called when populating the model, retrieves a single extent of text along with its
		 * typographical and semantic annotations.
		 */
		var retrieveText = function(offset, length, callback) {
			console.log("Retrieving " + length + " characters of text from " + offset);
			$.getJSON("api/text/textid/" + offset + "/" + (offset + length), function(data) {
				callback(data);
			});
		};

		/**
		 * The maximum number of character to retrieve in a single request from the text service
		 * when populating the text container. This must be a power of two - we don't check for this
		 * later on and setting it to anything else will cause confusion.
		 */
		var textChunkSize = 2048;

		/**
		 * Updates models.textModel with the newly retrieved text and annotations.
		 * 
		 * @param offset
		 *            The character offset to start pulling text
		 * @param forwards
		 *            If true treat the offset value as the first character in the resultant text,
		 *            otherwise treat it as the character beyond the final character in the
		 *            resultant text.
		 * @param height
		 *            Target height to fill to, relative to the value returned by the measure
		 *            function.
		 * @param measure
		 *            A function used to determine the height of a block of retrieved text and
		 *            annotations. Accepts HTML as its single argument and returns the pixel height
		 *            of the result.
		 */
		var updateTextAsync = function(offset, forwards, height, measure) {

			var textBoundaryReached = false;

			var markupStruct = function(struct) {
				return textus.markupText(struct.text, struct.offset, struct.typography, struct.semantics);
			};

			/* Struct is {offset:int, text:string, typography:[], semantics:[]}} */
			var fetch = function(struct) {
				if (measure(markupStruct(struct)) > height || textBoundaryReached) {
					trim(struct);
				} else {
					if (forwards) {
						retrieveText(struct.offset + struct.text.length, textChunkSize, function(data) {
							if (data.text.length < textChunkSize) {
								textBoundaryReached = true;
							}
							if (struct.text == "") {
								struct.typography = data.typography;
								struct.semantics = data.semantics;
							} else {
								data.typography.forEach(function(annotation) {
									if (annotation.start > offset + struct.text.length) {
										struct.typography.push(annotation);
									}
								});
								data.semantics.forEach(function(annotation) {
									if (annotation.start > offset + struct.text.length) {
										struct.semantics.push(annotation);
									}
								});
							}
							struct.text = struct.text + data.text;
							fetch(struct);
						});
					} else {
						var newOffset = Math.max(0, struct.offset - textChunkSize);
						if (newOffset == 0) {
							textBoundaryReached = true;
						}
						var sizeToFetch = struct.offset - newOffset;
						retrieveText(newOffset, sizeToFetch, function(data) {
							if (struct.text == "") {
								struct.typography = data.typography;
								struct.semantics = data.semantics;
							} else {
								data.typography.forEach(function(annotation) {
									if (annotation.end < struct.offset) {
										struct.typography.push(annotation);
									}
								});
								data.semantics.forEach(function(annotation) {
									if (annotation.end < struct.offset) {
										struct.semantics.push(annotation);
									}
								});
							}
							struct.offset = newOffset;
							struct.text = data.text + struct.text;
							fetch(struct);
						});
					}
				}
			};

			/**
			 * Trim the content of the input struct until the text exactly fits in the target
			 * container height. Do this by testing for a fit, and changing the start or end offset
			 * (depending on whether we're going forwards or backwards) by an amount which is
			 * progressively reduced each iteration.
			 */
			var trim = function(data) {
				var trimData = function(length) {
					var amountRemoved = data.text.length - length;
					return {
						text : forwards ? (data.text.substring(0, length)) : (data.text
								.substring(amountRemoved, length)),
						offset : forwards ? (data.offset) : (data.offset - amountRemoved),
						typography : data.typography,
						semantics : data.semantics
					};
				};

				var textLength = data.text.length - (textChunkSize - 1);
				var i = textChunkSize;
				while (i > 1) {
					i = i / 2;
					var test = trimData(textLength + i);
					if (measure(markupStruct(test)) <= height) {
						textLength = textLength + i;
					}
				}
				var t = trimData(textLength);
				var annotationFilter = function(a) {
					return a.end >= t.offset && a.start <= (t.offset + t.text.length);
				};
				models.textModel.set({
					text : t.text,
					offset : t.offset,
					typography : data.typography.filter(annotationFilter),
					semantics : data.semantics.filter(annotationFilter)
				});
			};

			fetch({
				text : "",
				offset : offset,
				typography : [],
				semantics : [],
				cachedHTML : null
			});

		};

		this.name = "ReadTextActivity";

		this.start = function(location) {

			// Create a new textView
			var textView = new TextView({
				textModel : models.textModel,
				presenter : {
					/**
					 * Called by the view when a selection of text has been made, used to set the
					 * text selection model.
					 * 
					 * @param start
					 *            The absolute index of the first character in the selected text.
					 * @param end
					 *            The absolute index of the last character in the selected text,
					 *            should be start + text.length assuming all's working.
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
					 * Called by the view when it's been resized and needs to have its text
					 * re-filled.
					 */
					requestTextFill : function() {
						updateTextAsync(location.offset, true, textView.pageHeight(), textView.measure);
					}
				},
				textLocationModel : models.textLocationModel,
				el : $('.main')
			});

			// Set up a listener on selection events on the text
			// selection model
			var s = models.textSelectionModel;
			s.bind("change", function(event) {
				if (s.get("text") != "") {
					alert("Text selected '" + s.get("text") + "' character range [" + s.get("start") + ","
							+ s.get("end") + "]");
				}
			});

			updateTextAsync(location.offset, true, textView.pageHeight(), textView.measure);

		};

		this.stop = function(callback) {
			// Unbind the change listener on the text selection model
			models.textSelectionModel.unbind("change");
			callback(true);
		};
	};
});