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
	 * 
	 * @param semantics
	 *            An array of semantic annotation objects to display in the container
	 * @param annotationContainer
	 *            The div into which annotation object representations are to be injected
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
	 * @param textContainer
	 *            The element containing the entire text area, used to set the canvas size
	 *            appropriately.
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
	 * 
	 * @param canvas
	 *            The CANVAS element to use when drawing the annotation markers
	 * @param textContainer
	 *            The element containing the entire text area, used to set the canvas size
	 *            appropriately.
	 * @param semantics
	 *            The semantic annotations, calling this will update the 'anchor' property which
	 *            then allows the renderLinks method to run correctly.
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
			var lineHeight = parseInt($(this).css("line-height").match(/\d+/)[0]);
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
				startlh : lineHeight
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
					//x : rightMargin,
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

	var TextView = Backbone.View.extend({

		initialize : function() {
			_.bindAll(this);
			var model = this.model = this.options.textModel;
			var presenter = this.presenter = this.options.presenter;
			this.selectionModel = this.options.selectionModel;
			this.$el.html(layout).unbind("mouseup").bind("mouseup", this.defineSelection);

			var pageCanvas = $('#pageCanvas');
			var linkCanvas = $('#linkCanvas');
			var pageText = $('.pageText');
			var annotations = $('.annotations');

			var resizeTimer = null;

			$(window).resize(function() {
				if (resizeTimer) {
					clearTimeout(resizeTimer);
				}
				resizeTimer = setTimeout(presenter.requestTextFill, 300);
				renderCanvas(pageCanvas, pageText, model.get("semantics"));
				renderLinks(pageText, linkCanvas, model.get("semantics"), annotations);
			});
			annotations.scroll(function() {
				renderLinks(pageText, linkCanvas, model.get("semantics"), annotations);
			});
			model.bind("change:text", function() {
				model.set({
					cachedHTML : textus.markupText(model.get("text"), model.get("offset"), model.get("typography"),
							model.get("semantics"))
				});
				pageText.html(model.get("cachedHTML"));
			});
			model.bind("change:semantics", function() {
				populateAnnotationContainer(model.get("semantics"), annotations);
				renderCanvas(pageCanvas, pageText, model.get("semantics"));
				renderLinks(pageText, linkCanvas, model.get("semantics"), annotations);
			});
		},

		/**
		 * Populates the test container with the specified HTML and returns its height in pixels.
		 */
		measure : function(html) {
			var targetWidth = $('.pageText').width();
			var testContainer = $('.pageTextMeasure');
			testContainer.width(targetWidth);
			testContainer.html(html);
			var height = testContainer.height();
			testContainer.html("");
			return height;
		},

		pageHeight : function() {
			return $('.pageText').height();
		},

		/**
		 * Handle text selection, pulls the current selection out and calls the presenter with it if
		 * possible.
		 */
		defineSelection : function() {
			/*
			 * Calculate the offset of the current node relative to its parent, where the offset is
			 * the sum of the lengths of all preceding text nodes not including the current one.
			 * This is needed because we want to get the number of characters in text nodes between
			 * the selection end points and the start of the child list of the parent to cope with
			 * the additional spans inserted to mark semantic annotations.
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
			/*
			 * Only currently supporting the non-IE text range objects, this works fine for the
			 * browsers we actually support!
			 */
			if (window.getSelection && this.presenter && this.model) {
				var userSelection = window.getSelection();
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
				console.log("MS Text Range not supported!");
			}
		}

	});

	return TextView;

});