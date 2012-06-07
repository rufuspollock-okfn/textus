define([ 'jquery', 'underscore', 'backbone', 'textus', 'views/textView', 'views/textFooterView',
		'views/editSemanticAnnotationView' ], function($, _, Backbone, textus, TextView, TextFooterView,
		EditSemanticAnnotationView) {

	return function(models) {

		/**
		 * Called when populating the model, retrieves a single extent of text along with its
		 * typographical and semantic annotations.
		 */
		var retrieveText = function(textid, offset, length, callback) {
			console.log("Retrieving " + length + " characters of text from " + offset);
			$.getJSON("api/text/" + textid + "/" + offset + "/" + (offset + length), function(data) {
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
		 * @param textid
		 *            The ID of the text to retrieve
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
		var updateTextAsync = function(textid, offset, forwards, height, measure) {

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
						retrieveText(textid, struct.offset + struct.text.length, textChunkSize, function(data) {
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
						var sizeToFetch = struct.offset - newOffset;
						if (newOffset == 0) {
							updateTextAsync(textid, 0, true, height, measure);
							return;
						} else {
							retrieveText(textid, newOffset, sizeToFetch, function(data) {
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
				}
			};

			/**
			 * Trim the content of the input struct until the text exactly fits in the target
			 * container height. Do this by testing for a fit, and changing the start or end offset
			 * (depending on whether we're going forwards or backwards) by an amount which is
			 * progressively reduced each iteration.
			 */
			var trim = function(data) {
				console.log("Starting trim function, text has offset " + data.offset + " and length "
						+ data.text.length);
				var trimData = function(length) {
					var amountRemoved = data.text.length - length;
					return {
						text : forwards ? (data.text.substring(0, length)) : (data.text.substring(amountRemoved,
								data.text.length)),
						offset : forwards ? (data.offset) : (data.offset + amountRemoved),
						typography : data.typography,
						semantics : []
					};
				};

				var textLength = data.text.length - (textChunkSize - 1);
				console.log("Text length starts at " + textLength);
				var i = textChunkSize;
				while (i > 1) {
					i = i / 2;
					var test = trimData(textLength + i);
					console.log("Trim - end offset of text is " + (test.offset + test.text.length));
					console.log("Trimmed text : " + test.text.substring(0, 20) + "...");
					var measured = measure(markupStruct(test));
					if (measured <= height) {
						textLength = textLength + i;
						console.log("Text length is " + textLength + " (+" + i + ")");
					} else {
						console.log("Text is too high - measured at " + measured + ", maximum is " + height);
					}
				}
				var t = trimData(textLength);
				var annotationFilter = function(a) {
					return a.end >= t.offset && a.start <= (t.offset + t.text.length);
				};
				console.log("Offset = " + t.offset + " text.length = " + t.text.length);
				/*
				 * Handle the special case where we went back and the start offset ended up being
				 * zero. In these cases we should re-do the entire call going fowards from zero
				 */
				if (!forwards && t.offset == 0) {
					/*
					 * Reached the start of the text by going backwards, re-do by running forwards
					 * from offset zero
					 */
					updateTextAsync(0, true, height, measure);
				} else {
					if (forwards && t.text.length == 0) {
						/*
						 * Reached the end of the text, re-do by running backwards from the end to
						 * fill the page
						 */
						updateTextAsync(textid, t.offset, false, height, measure);
					} else {
						/*
						 * Got a sensible location, update the textModel and textLocationModel with
						 * the text, offset, typography and semantics.
						 */
						models.textModel.set({
							text : t.text,
							offset : t.offset,
							typography : data.typography.filter(annotationFilter),
							semantics : data.semantics.filter(annotationFilter)
						});
						models.textLocationModel.set({
							offset : t.offset
						});
					}
				}
			};

			/*
			 * Start the fetch, zero-ing the accumulators used to collect the text and annotations.
			 */
			fetch({
				text : "",
				offset : offset,
				typography : [],
				semantics : [],
				cachedHTML : null
			});

		};

		this.name = "ReadTextActivity";
		
		this.pageTitle = "Reading...";

		var viewsToDestroy = null;

		this.start = function(location) {
			$.getJSON("api/user", function(data) {
				if (data.loggedin) {
					models.loginModel.set({
						loggedIn : data.loggedin,
						user : data.details.user
					});
				} else {
					models.loginModel.set({
						loggedIn : false,
						user : null
					});
				}
				start2(location);
			});
		};

		var start2 = function(location) {

			/*
			 * Capture the initial offset and the textId from the URL (in turn derived from the
			 * location object)
			 */
			models.textLocationModel.set({
				offset : location.offset,
				textId : location.textid
			});

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
						if (!isNaN(start) && !isNaN(end)) {
							models.textSelectionModel.set({
								start : ((start < end) ? start : end),
								end : ((end > start) ? end : start),
								text : text
							});
						}
					},

					/**
					 * Called by the view when it's been resized and needs to have its text
					 * re-filled.
					 */
					requestTextFill : function() {
						updateTextAsync(models.textLocationModel.get("textId"), models.textLocationModel.get("offset"),
								true, textView.pageHeight(), textView.measure);
					}
				},
				textLocationModel : models.textLocationModel,
				el : $('.main')
			});

			var footerView = new TextFooterView({
				presenter : {
					back : function() {
						updateTextAsync(models.textLocationModel.get("textId"), models.textLocationModel.get("offset"),
								false, textView.pageHeight(), textView.measure);
						console.log("Back button pressed.");
					},
					forward : function() {
						updateTextAsync(models.textLocationModel.get("textId"), models.textLocationModel.get("offset")
								+ models.textModel.get("text").length, true, textView.pageHeight(), textView.measure);
						console.log("Forward button pressed.");
					}
				},
				el : $('.footer')
			});

			/*
			 * Store references to the two views to pass to the cleanup function on activity exit.
			 */
			viewsToDestroy = [ textView, footerView ];

			/*
			 * Set up a listener on selection events on the text selection model.
			 */
			var s = models.textSelectionModel;

			s.bind("change", function(event) {
				if (models.loginModel.get("loggedIn") == false) {
					return;
				}
				var text = s.get("text");
				var start = s.get("start");
				var end = s.get("end");
				var textId = models.textLocationModel.get("textId");
				$('.annotationEditor').remove();
				if (s.get("text") != "") {
					var editView = new EditSemanticAnnotationView({
						text : s.get("text"),
						start : s.get("start"),
						end : s.get("end"),
						textId : models.textLocationModel.get("textId"),
						annotation : {
							type : "textus:comment",
							payload : null
						},
						presenter : {
							storeAnnotation : function(data) {
								console.log("Annotation data : " + data);
								$('.annotationEditor').remove();
								var newAnnotation = {
									start : s.get("start"),
									end : s.get("end"),
									textId : models.textLocationModel.get("textId"),
									type : data.type,
									payload : data.payload
								};
								$.post("api/semantics", newAnnotation, function(returnedAnnotation) {
									var semanticsArray = models.textModel.get("semantics").slice(0);
									semanticsArray.push(returnedAnnotation);
									models.textModel.set({
										semantics : semanticsArray
									});
								});
							}
						}
					}).render();
					$('body').append("<div class='annotationEditor'/>");
					$('.annotationEditor').html(editView.el);

					// alert("Text selected '" + s.get("text") + "' character range [" +
					// s.get("start") + ","
					// + s.get("end") + "] from textId '" + textId + "'");
				} else {
					$('.annotationEditor').remove();
				}
			});

			/*
			 * Listen to changes on the offset property and re-write the URL appropriately.
			 */
			var t = models.textLocationModel;
			t.bind("change offset", function() {
				location.router.navigate("text/" + location.textid + "/" + t.get("offset"));
			});

			/*
			 * Get text and update the view based on the location passed into the activity via the
			 * URL
			 */
			updateTextAsync(models.textLocationModel.get("textId"), models.textLocationModel.get("offset"), true,
					textView.pageHeight(), textView.measure);

		};

		/**
		 * Called when stopping the activity, removes any event listeners and similar that would
		 * cause zombie instances of the text rendered to be left kicking around.
		 */
		this.stop = function(callback) {
			// Unbind the change listener on the text selection model
			models.textSelectionModel.unbind();
			models.textModel.unbind();
			models.textLocationModel.unbind();
			models.textModel.set({
				text : "",
				offset : 0,
				typography : [],
				semantics : [],
				cachedHTML : null,
				structure : []
			});
			models.textLocationModel.set({
				textId : null,
				offset : 0
			});
			if (viewsToDestroy) {
				viewsToDestroy.forEach(function(view) {
					if (view.destroy) {
						view.destroy();
					}
					view.remove();
					view.unbind();
				});
			}
			$(".main-wrapper").append($('<div class="main"/>'));
			$(".footer-wrapper").append($('<div class="footer"/>'));
			callback(true);
		};
	};
});