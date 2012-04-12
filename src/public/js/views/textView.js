// Defines TextView

define([ 'jquery', 'underscore', 'backbone', 'textus', 'text!templates/textView.html' ], function($, _, Backbone,
		textus, layout) {

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
	 * Create DIV elements in the annotation container corresponding to the supplied semantic
	 * annotations.
	 */
	var populateAnnotationContainer = function(semantics, annotationContainer) {
		console.log("Populating annotation container");
		console.log(annotationContainer);
		annotationContainer.empty();
		semantics.sort(function(a, b) {
			if (a.start != b.start) {
				return a.start - b.start;
			} else {
				return a.end - b.end;
			}
		});
		semantics.forEach(function(annotation) {
			annotationContainer.append("<div annotation-id=\"" + annotation.id + "\">" + annotation.id + "</div>");
		});
	};

	/**
	 * Resize, clear and re-render the lines linking annotation blocks to their corresponding divs
	 * 
	 * @param canvas
	 *            The CANVAS element to use when drawing in the annotation links
	 * @param semantics
	 *            The semantic annotations, which must have been updated with the 'anchor' property
	 *            by the renderCanvas method prior to this being called.
	 * @param annotationContainer
	 *            The DIV containing annotation elements as immediate children.
	 */
	var renderLinks = function(textContainer, canvas, semantics, annotationContainer) {
		var width = textContainer.outerWidth(true);
		var height = textContainer.outerHeight(true);
		canvas.get(0).height = height;
		canvas.get(0).width = width;
		var ctx = canvas.get(0).getContext("2d");
		ctx.lineWidth = 2;
		/*
		 * Gather up all the annotated and positioned regions on the page ready to then iterate over
		 * the elements in the annotation container and draw in the links.
		 */
		regions = {};
		semantics.forEach(function(annotation) {
			if (annotation.hasOwnProperty("anchor")) {
				regions[annotation.id] = {
					x : annotation.anchor.x,
					y : annotation.anchor.y,
					colour : (annotation.colour ? annotation.colour : "rgba(0,0,0,0.2)")
				};
			}
		});
		annotationContainer.children().each(function() {
			var child = $(this);
			var id = child.attr("annotation-id");
			if (regions[id]) {
				var coords = relativeCoords(canvas, child);
				if (coords.y >= (-child.outerHeight()) && coords.y <= height) {
					var region = regions[id];
					var anchorY = coords.y + (child.outerHeight() / 2);
					if (anchorY > 0 && anchorY < height) {
						ctx.strokeStyle = region.colour;
						ctx.beginPath();
						ctx.moveTo(region.x, region.y);
						ctx.lineTo(coords.x, anchorY);
						ctx.closePath();
						ctx.stroke();
					}
					ctx.fillStyle = region.colour;
					ctx.fillRect(coords.x, coords.y, child.outerWidth(), child.outerHeight());
				}
			}
		});
	};

	/**
	 * Resize, clear and re-render the overlay of annotation positions on the canvas. This assumes
	 * that textContainer already contains the appropriate markup including the empty span elements
	 * indicating annotation start and end points. Updates the 'anchor' property of the annotation
	 * elements to be the coordinate to use when drawing lines to the divs.
	 */
	var renderCanvas = function(canvas, textContainer, semantics) {
		var width = textContainer.outerWidth(true);
		var height = textContainer.outerHeight(true);
		canvas.get(0).height = height;
		canvas.get(0).width = width;
		var ctx = canvas.get(0).getContext("2d");
		var leftMargin = 20;
		var rightMargin = textContainer.width() + leftMargin;
		/*
		 * Retrieve a list of all the elements corresponding to semantic annotations, pair them up
		 * in a map containing all the coordinates and identifiers. Regions are defined as
		 * {id:string, startx:int, starty:int, startlh:int, endx:int, endy:int, endlh:int} and keyed
		 * on the same id string as held in the record.
		 */
		var regions = {};
		var regionList = [];
		$(".textus-annotation-start").each(function() {
			var coords = relativeCoords(canvas, $(this));
			var lineHeight = $(this).css("line-height").match(/\d+/)[0];
			var id = $(this).attr("annotation-id");
			// If we're right on the end of the line move the start coordinates to the following
			// line
			if (coords.x >= rightMargin) {
				coords.x = leftMargin;
				coords.y = coords.y + lineHeight;
			}
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

		/*
		 * A number of pixels to shift the coloured block down by, helps balance the result
		 * visually.
		 */
		var colourOffset = 3;
		// Render all the regions...
		regionList.forEach(function(r) {
			/*
			 * Retrieve the colour, if specified, for this region. In the full system this will be
			 * derived from other properties of the annotation but this will do for now. Defaults to
			 * red if colour isn't available.
			 */
			var annotation = regions[r.id];
			if (annotation.colour) {
				ctx.fillStyle = annotation.colour;
			} else {
				ctx.fillStyle = "rgba(255,0,0,0.1)";
			}
			if (r.starty == r.endy) {
				/*
				 * Check for a region where the annotation start and end points are on the same
				 * line, in which case the rectangle is simple.
				 */
				ctx.fillRect(r.startx, colourOffset + r.starty - r.startlh, r.endx - r.startx, r.startlh);
				annotation.anchor = {
					x : r.endx,
					y : r.endy - (r.endlh / 2)
				};
			} else {
				/*
				 * Otherwise draw rectangles from the start to the right margin and from the left
				 * margin to the end.
				 */
				ctx.fillRect(leftMargin, colourOffset + r.endy - r.endlh, r.endx - leftMargin, r.endlh);
				ctx.fillRect(r.startx, colourOffset + r.starty - r.startlh, rightMargin - r.startx, r.startlh);
				annotation.anchor = {
					x : rightMargin,
					y : r.starty - (r.startlh / 2)
				};
				/*
				 * If there were lines inbetween the two we just drew, draw in a box to completely
				 * fill the space.
				 */
				if (r.starty < r.endy - r.endlh) {
					ctx.fillRect(leftMargin, colourOffset + r.starty, rightMargin - leftMargin, r.endy
							- (r.starty + r.endlh));
				}
			}
			/*
			 * Draw in start and end points for annotations, just to make things more obvious when
			 * they're going wrong!
			 */
			ctx.fillRect(r.startx, colourOffset + r.starty - r.startlh, (Math.min(6, rightMargin - r.startx)),
					r.startlh);
			ctx.fillRect(r.endx - 6, colourOffset + r.endy - r.endlh, 6, r.endlh);
		});
	};

	/**
	 * Populate the text area from the model
	 */
	var renderText = function(canvas, textContainer, model) {
		if (model.cachedHTML == null) {
			model.set({
				cachedHTML : textus.markupText(model.get("text"), model.get("offset"), model.get("typography"), model
						.get("semantics"))
			});
		}
		textContainer.html(model.get("cachedHTML"));
		populateAnnotationContainer(model.get("semantics"), $('.annotations'));
		renderCanvas(canvas, textContainer, model.get("semantics"));
		renderLinks(textContainer, $('#linkCanvas'), model.get("semantics"), $('.annotations'));
	};

	/**
	 * Retrieve and test-render text to at least fill a particular height and width container,
	 * calling the supplied callback with a structure containing the text, offset, semantic and
	 * typographical annotations and cached HTML
	 * 
	 * @param width
	 *            The target width of the container in pixels - the container's width will be
	 *            explicitly set to this value.
	 * @param height
	 *            The target height of the container in pixels - text will be loaded into the
	 *            container to get to this height or more. The text will almost certainly then need
	 *            to be trimmed to the appropriate height.
	 * @param offset
	 *            The offset within the source text from which to load data. This offset can be
	 *            either the first character in the stream (if forwards==true) or one beyond the
	 *            final character if (forwards==false)
	 * @param presenter
	 *            The presenter to be used to retrieve text from the server, provides the
	 *            retrieveText(offset, size, callback) method.
	 * @param forwards
	 *            Whether the offset should be interpreted as the start or end of the text.
	 * @param callback
	 *            Called on completion and passed a data structure containing the fetched text which
	 *            will at least fill the specified dimensions along with annotations. The structure
	 *            is of the form: {text:string, offset:int, typography:[], semantics:[],
	 *            cachedHTML:string}
	 */
	var fillContainer = function(width, height, offset, presenter, forwards, callback) {
		console.log("Attempting to fill container with height " + height);
		// Set up the test container
		var test = $('.pageTextMeasure');
		test.html("");
		test.width(width);
		var textBoundaryReached = false;
		var heightExceeded = false;
		var stepSize = 2048;

		/**
		 * Fetch text from the presenter until it at least fills the text container to the target
		 * height when rendered. Retrieve text in chunks of stepSize until we have enough.
		 */
		var fetch = function(struct) {
			/*
			 * Initially render the text in the struct to the test container, and see whether it
			 * overflows.If it does then return the current state via the callback. We also return
			 * if the last retrieval operation hit the boundary of the underlying text source,
			 * either at the start when going backwards or at the end when going forwards.
			 */
			test.html(textus.markupText(struct.text, struct.offset, struct.typography, []));
			heightExceeded = (test.height() > height);
			if (heightExceeded || textBoundaryReached) {
				test.html("");
				console.log(struct);
				trim(struct);
			}
			/*
			 * If there wasn't enough text to over-fill the container then we need to fetch more.
			 */
			else {
				if (forwards) {
					presenter.retrieveText(struct.offset + struct.text.length, stepSize, function(data) {
						if (data.text.length < stepSize) {
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
					var newOffset = Math.max(0, struct.offset - stepSize);
					if (newOffset == 0) {
						textBoundaryReached = true;
					}
					var sizeToFetch = struct.offset - newOffset;
					presenter.retrieveText(newOffset, sizeToFetch, function(data) {
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
		 * Trim the content of the input struct until the text exactly fits in the target container
		 * height. Do this by testing for a fit, and changing the start or end offset (depending on
		 * whether we're going forwards or backwards) by an amount which is progressively reduced
		 * each iteration.
		 */
		var trim = function(data) {
			var trimData = function(length) {
				var amountRemoved = data.text.length - length;
				return {
					text : forwards ? (data.text.substring(0, length)) : (data.text.substring(amountRemoved, length)),
					offset : forwards ? (data.offset) : (data.offset - amountRemoved)
				};
			};

			var textLength = data.text.length - (stepSize - 1);
			var i = stepSize;
			while (i > 1) {
				i = i / 2;
				// 'i' will range from stepsize/2 to 1 then terminate
				var testData = trimData(textLength + i);
				test.html(textus.markupText(testData.text, testData.offset, data.typography, data.semantics));
				if (test.height() <= height) {
					textLength = textLength + i;
				}
			}
			var trimmed = trimData(textLength);
			var annotationFilter = function(annotation) {
				console.log(annotation);
				console.log(trimmed.offset + ", " + (trimmed.offset + trimmed.text.length));
				return annotation.end >= trimmed.offset && annotation.start <= (trimmed.offset + trimmed.text.length);
			};
			trimmed.typography = data.typography.filter(annotationFilter);
			trimmed.semantics = data.semantics.filter(annotationFilter);
			test.html("");
			callback(trimmed);
		};

		fetch({
			text : "",
			offset : offset,
			typography : [],
			semantics : [],
			cachedHTML : null
		}, 1024);

	};

	/**
	 * Calculate the offset of the current node relative to its parent, where the offset is the sum
	 * of the lengths of all preceding text nodes not including the current one. This is needed
	 * because we want to get the number of characters in text nodes between the selection end
	 * points and the start of the child list of the parent to cope with the additional spans
	 * inserted to mark semantic annotations.
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

	var TextView = Backbone.View.extend({

		render : function(event) {
			this.$el.html(layout).unbind("mouseup").bind("mouseup", this.defineSelection);
			var model = this.model;
			var presenter = this.presenter;
			if (model) {
				renderText($('#pageCanvas'), $('.pageText'), model, presenter);

			}
			$('.annotations').scroll(function(event) {
				renderLinks($('.pageText'), $('#linkCanvas'), model.get("semantics"), $('.annotations'));
			});
		},

		initialize : function() {
			_.bindAll(this);
			this.model = this.options.textModel;
			this.presenter = this.options.presenter;
			this.selectionModel = this.options.selectionModel;
			var model = this.model;
			$(window).resize(function() {
				renderCanvas($('#pageCanvas'), $('.pageText'), model.get("semantics"));
				renderLinks($('.pageText'), $('#linkCanvas'), model.get("semantics"), $('.annotations'));
			});

		},

		/**
		 * Set the location, fetching the text, updating the model and re-rendering
		 */
		setTextLocation : function(offset) {
			var model = this.model;
			// fillContainer = function(width, height, offset, presenter, callback) {
			console.log($('.pageText').width() + "," + $('.pageText').height());
			console.log("fillContainer(" + $('.pageText').width() + "," + 400 + "," + offset + ")");
			fillContainer($('.pageText').width(), $('.pageText').height(), offset, this.presenter, true,
					function(data) {
						console.log("Received data from trim function");
						console.log(data);
						model.set({
							cachedHTML : data.cachedHTML,
							text : data.text,
							offset : data.offset,
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
					var fromChar = parseInt(fromNode.parentNode.getAttribute("offset"))
							+ parseInt(userSelection.anchorOffset) + offsetInParent(fromNode)
							- this.model.get("offset");
					var toChar = parseInt(toNode.parentNode.getAttribute("offset"))
							+ parseInt(userSelection.focusOffset) + offsetInParent(toNode) - this.model.get("offset");
					this.presenter.handleTextSelection(fromChar + this.model.get("offset"), toChar
							+ this.model.get("offset"), this.model.get("text").substring(fromChar, toChar));
				}
			} else if (document.selection) {
				console.log("Fetching MS Text Range object (IE).");
				userSelection = document.selection.createRange();
			}
		}

	});

	return TextView;

});