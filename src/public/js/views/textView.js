// Defines TextView

define([ 'jquery', 'underscore', 'backbone', 'textus',
		'text!templates/textView.html' ], function($, _, Backbone, textus,
		layout) {

	/**
	 * Get the offset of the target in the container's coordinate space.
	 */
	var relativeCoords = function(container, target) {
		return {
			x : target.offset().left - container.offset().left,
			y : target.offset().top - container.offset().top
		};
	};

	/**
	 * Resize, clear and re-render the overlay of annotation positions on the
	 * canvas. This assumes that textContainer already contains the appropriate
	 * markup including the empty span elements indicating annotation start and
	 * end points.
	 */
	var renderCanvas = function(canvas, textContainer, semantics) {
		var width = textContainer.outerWidth(true);
		var height = textContainer.outerHeight(true);
		// canvas.height(height).width(width);
		canvas.get(0).height = height;
		canvas.get(0).width = width;
		var ctx = canvas.get(0).getContext("2d");
		// Retrieve a list of all the elements corresponding to semantic
		// annotations, pair them up in a map containing all the
		// coordinates and
		// identifiers. Regions are defined as {id:string, startx:int,
		// starty:int, startlh:int, endx:int, endy:int, endlh:int} and
		// keyed on
		// the same id string as held in the record.
		var regions = {};
		var regionList = [];
		$(".textus-annotation-start").each(function() {
			var coords = relativeCoords(canvas, $(this));
			var lineHeight = $(this).css("line-height").match(/\d+/)[0];
			var id = $(this).attr("annotation-id");
			regions[id] = {
				id : id,
				startx : coords.x,
				starty : coords.y,
				startlh : parseInt(lineHeight)
			};
		});
		$(".textus-annotation-end").each(function() {
			var coords = relativeCoords(canvas, $(this));
			var lineHeight = $(this).css("line-height").match(/\d+/)[0];
			var id = $(this).attr("annotation-id");
			var struct = regions[id];
			struct.endx = coords.x;
			struct.endy = coords.y;
			struct.endlh = parseInt(lineHeight);
			regionList.push(struct);
		});
		regions = {};
		semantics.forEach(function(annotation) {
			regions[annotation.id] = annotation;
		});
		var leftMargin = 20;
		var rightMargin = textContainer.width() + leftMargin;
		// A number of pixels to shift the coloured block down by, helps balance
		// the result visually.
		var colourOffset = 3;
		// Render all the regions...
		regionList.forEach(function(r) {
			// Retrieve the colour, if specified, for this region. In
			// the full
			// system this will be derived from other properties of the
			// annotation but this will do for now. Defaults to red if
			// colour
			// isn't available.
			var annotation = regions[r.id];
			if (annotation.colour) {
				ctx.fillStyle = annotation.colour;
			} else {
				ctx.fillStyle = "rgba(255,0,0,0.1)";
			}
			if (r.starty == r.endy) {
				// Check for a region where the annotation start and end
				// points
				// are on the same line, in which case the rectangle is
				// simple.
				ctx.fillRect(r.startx, colourOffset + r.starty - r.startlh,
						r.endx - r.startx, r.startlh);
			} else {
				// Otherwise draw rectangles from the start to the right
				// margin
				// and from the left margin to the end.
				ctx.fillRect(leftMargin, colourOffset + r.endy - r.endlh,
						r.endx - leftMargin, r.endlh);
				ctx.fillRect(r.startx, colourOffset + r.starty - r.startlh,
						rightMargin - r.startx, r.startlh);
				// If there were lines inbetween the two we just drew,
				// draw in a
				// box to completely fill the space.
				if (r.starty < r.endy - r.endlh) {
					ctx.fillRect(leftMargin, colourOffset + r.starty,
							rightMargin - leftMargin, r.endy
									- (r.starty + r.endlh));
				}
			}
			// Draw in start and end points for annotations, just to
			// make things
			// more obvious when they're going wrong!
			ctx.fillRect(r.startx, colourOffset + r.starty - r.startlh, 6,
					r.startlh);
			ctx.fillRect(r.endx - 6, colourOffset + r.endy - r.endlh, 6,
					r.endlh);
		});
	};

	/**
	 * Populate the text area from the model
	 */
	var renderText = function(canvas, textContainer, model) {
		if (model.cachedHTML == null) {
			model.set({
				cachedHTML : textus.markupText(model.get("text"), model
						.get("offset"), model.get("typography"), model
						.get("semantics"))
			});
		}
		textContainer.html(model.get("cachedHTML"));
		renderCanvas(canvas, textContainer, model.get("semantics"));
	};

	/**
	 * Render text, cropping to a particular size container and returning the
	 * marked up text along with the start and end indices to which it was
	 * clipped. Uses the presenter to acquire the actual text and annotations.
	 */
	var renderTextAndClip = function(offset, height, textContainer) {
		var container = $('.pageTextMeasure');
		container.width(textContainer.width());
		console.log("Set test container to width=" + container.width());
		// Container for the content
		var stepSize = 1024;
		// Get an initial chunk of content
		var contents = _getTextAndAnnotations(offset, stepSize);
		// Initially we fetch blocks of text and join them and their
		// annotation
		// sets together until we have something that overflows the
		// desired
		// height...
		var doneInitialFill = false;
		while (!doneInitialFill) {
			// First test whether we've already overflowed the container
			container.html(textus.markupText(contents.text, offset,
					contents.typography, contents.semantics));
			if (container.height() >= height) {
				doneInitialFill = true;
			} else {
				// Retrieve another chunk of text and annotations and
				// merge it
				// with the existing content.
				var more = _getTextAndAnnotations(
						offset + contents.text.length, stepSize);
				if (more.text == "") {
					// Text member will be the empty string if there's
					// no more
					// text to fetch, i.e. we're at the end of the
					// document.
					doneInitialFill = true;
				} else {
					// Merge the returned text and annotations into the
					// current
					// content and go around again.
					contents.text = contents.text + more.text;
					// Don't merge annotations with start positions less
					// than
					// the start of the new block, we already have those
					// by
					// definition.
					more.typography.forEach(function(annotation) {
						if (annotation.start > offset + contents.text.length) {
							contents.typography.push(annotation);
						}
					});
					// And the same for semantic annotations...
					more.semantics.forEach(function(annotation) {
						if (annotation.start > offset + contents.text.length) {
							contents.semantics.push(annotation);
						}
					});

				}
			}
		}
		// At this point the text is definitely between 0 and stepSize
		// too big,
		// and stepSize is a power of two. We halve it initially and
		// refine
		// until we have the correct number of characters. Firstly we
		// keep a
		// copy of the overflowing text.
		var originalText = contents.text;
		// Set the contents text to be the original with stepSize
		// characters
		// lopped off the end, we'll add these back on shortly.
		contents.text = contents.text.subString(0, contents.text.length
				- stepSize);
		stepSize = stepSize / 2;
		// Store the last rendition which fitted within the bounds,
		// we'll return
		// this later.
		var lastRender = textus.markupText(contents.text, offset,
				content.typography, content.semantics);
		while (stepsize > 0) {
			// We know the current amount of text fits, try adding more.
			// If it
			// still fits then set the current amount to that quantity.
			// In
			// either case reduce the step size.
			var candidateText = originalText.subString(contents.text.length
					+ stepSize);
			var thisRender = textus.markupText(candidateText, offset,
					content.typography, content.semantics);
			container.html(thisRender);
			if (container.height() <= height) {
				contents.text = candidateText;
				lastRender = thisRender;
			}
			if (stepSize == 1) {
				stepSize = 0;
			} else {
				stepSize = stepSize / 2;
			}
		}
		// Clear the temporary container
		container.html("");
		// The var 'lastRender' now contains the rendered text, and
		// 'contents'
		// contains the source text and annotations.
		return {
			text : contents.text,
			typography : contents.typography,
			semantics : contents.semantics,
			html : lastRender
		};
	};

	/**
	 * Helper method used by the view when it needs to acquire more text
	 */
	var _getTextAndAnnotations = function(offset, length) {
		if (this.presenter) {
			return this.presenter.getTextAndAnnotations(offset, length);
		}
		console.log("No presenter defined, can't acquire text to render!");
		return {
			text : "",
			typography : [],
			semantics : []
		};
	};

	/**
	 * Calculate the offset of the current node relative to its parent, where
	 * the offset is the sum of the lengths of all preceding text nodes not
	 * including the current one. This is needed because we want to get the
	 * number of characters in text nodes between the selection end points and
	 * the start of the child list of the parent to cope with the additional
	 * spans inserted to mark semantic annotations.
	 */
	var offsetInParent = function(currentNode) {
		var count = 0;
		var node = currentNode.previousSibling;
		while (node != null) {
			if (node.nodeType == 3) {
				count = count + node.length;
			}
			node = node.previousSibling;
		}
		return count;
	};

	var TextView = Backbone.View
			.extend({

				render : function(event) {
					this.$el.html(layout).unbind("mouseup").bind("mouseup",
							this.defineSelection);
					var model = this.model;
					if (model) {
						renderText($('#pageCanvas'), $('.pageText'), model);
					}
				},

				initialize : function() {
					_.bindAll(this);
					this.model = this.options.textModel;
					this.presenter = this.options.presenter;
					this.selectionModel = this.options.selectionModel;
					var model = this.model;
					$(window).resize(
							function() {
								renderCanvas($('#pageCanvas'), $('.pageText'),
										model.get("semantics"));
							});
				},

				/**
				 * Set the location, fetching the text, updating the model and
				 * re-rendering
				 */
				setTextLocation : function(offset) {
					var model = this.model;
					this.presenter.retrieveText(offset, 470, function(data) {
						model.set({
							cachedHTML : null,
							text : data.text,
							offset : data.start,
							typography : data.typography,
							semantics : data.semantics
						});
						renderText($('#pageCanvas'), $('.pageText'), model);
					});
				},

				// Attempt to get the selected text range, after
				// trimming any markup
				defineSelection : function() {
					var userSelection = "No selection defined!";
					if (window.getSelection && this.presenter && this.model) {
						userSelection = window.getSelection();
						var fromNode = userSelection.anchorNode;
						var toNode = userSelection.focusNode;
						if (fromNode != null && toNode != null) {
							var fromChar = parseInt(fromNode.parentNode
									.getAttribute("offset"))
									+ parseInt(userSelection.anchorOffset)
									+ offsetInParent(fromNode)
									- this.model.get("offset");
							var toChar = parseInt(toNode.parentNode
									.getAttribute("offset"))
									+ parseInt(userSelection.focusOffset)
									+ offsetInParent(toNode)
									- this.model.get("offset");
							this.presenter.handleTextSelection(fromChar
									+ this.model.get("offset"), toChar
									+ this.model.get("offset"), this.model.get(
									"text").substring(fromChar, toChar));
						}
					} else if (document.selection) {
						console.log("Fetching MS Text Range object (IE).");
						userSelection = document.selection.createRange();
					}
				}

			});

	return TextView;

});