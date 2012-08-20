// Defines TextView

define([ 'textus', 'text!templates/textView.html', 'views/annotationTypes', 'models' ], function(textus, layout,
		annotationTypes, models) {

	/**
	 * Get the offset of the target in the container's coordinate space.
	 */
	function relativeCoords(container, target) {
		return {
			x : target.offset().left - container.offset().left,
			y : target.offset().top - container.offset().top
		};
	}

	var annotationRenderers = annotationTypes.renderers;

	/**
	 * Create DIV elements in the annotation container corresponding to the supplied semantic
	 * annotations.
	 * 
	 * @param semantics
	 *            An array of semantic annotation objects to display in the container
	 * @param annotationContainer
	 *            The div into which annotation object representations are to be injected
	 */
	function populateAnnotationContainer(semantics, annotationContainer, presenter) {
		annotationContainer.empty();
		semantics.sort(function(a, b) {
			if (a.start != b.start) {
				return a.start - b.start;
			} else {
				return a.end - b.end;
			}
		});
		semantics.forEach(function(annotation) {
			var d = $("<div class='annotation' annotation-id=\"" + annotation.id + "\"/>");
			var colour = {
				'private' : 'red',
				'provisional' : '#cc9933',
				'final' : 'black',
				'unknown' : 'pink'
			}[annotation.visibility ? annotation.visibility : 'unknown'];
			var userName = (annotation.dynamic.displayName ? annotation.dynamic.displayName : annotation.user);
			var userDisplay = {
				'private' : userName + " <sup style='color:" + colour + "'>[private]</sup>",
				'provisional' : userName + " <sup style='color:" + colour + "'>[provisional]</sup>",
				'final' : userName,
				'unknown' : userName
			}[annotation.visibility ? annotation.visibility : 'unknown'];
			d.append($("<div style='color:#555; padding-bottom:4px;'>" + userDisplay + "</div>"));
			if (annotationRenderers[annotation.type]) {
				d.append(annotationRenderers[annotation.type](annotation.payload));
			} else {
				d.append(annotation.id);
			}
			if (models.loginModel.get("loggedIn") && models.loginModel.get("user").id == annotation.user
					&& annotation.visibility != 'final') {
				var a = $("<a class='btn btn-success edit-annotation-button'>"
						+ "<i class='icon-edit icon-white'></i></a>");
				a.click(function(event) {
					if (presenter) {
						presenter.editAnnotation(event, annotation);
					}
				});
				d.prepend(a);

			}
			annotationContainer.append(d);
		});
	}

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
	function renderLinks(textContainer, canvas, semantics, annotationContainer) {
		var width = textContainer.outerWidth(true);
		var height = textContainer.outerHeight(true);
		var backgroundHeight = annotationContainer.outerHeight(true);
		canvas.get(0).height = height - 20;
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
					colour : (annotation.dynamic.colour ? annotation.dynamic.colour : "rgba(0,0,0,0.2)")
				};
			}
		});

		/*
		 * Remove any annotation elements which have somehow managed to get into the panel even
		 * though we don't have the corresponding region rendered - this can happen sometimes with
		 * annotations which end with certain kinds of block elements. While we're doing this sum up
		 * the total height of all annotation divs which are left in order to work out whether we
		 * can balance them.
		 */
		var space = annotationContainer.height() - 60;
		annotationContainer.children().each(function() {
			var id = $(this).attr("annotation-id");
			if (regions[id]) {
				var height = $(this).outerHeight();
				space = space - height;
			} else {
				$(this).remove();
			}
		});
		$('.annotation-spacer', annotationContainer).remove();
		if (space > 0) {
			annotationContainer.children().each(function() {
				/* Find ideal target offset */
				var child = $(this);
				var id = child.attr("annotation-id");
				var childHeight = child.outerHeight(true);
				var desiredY = Math.max(0, regions[id].y - childHeight / 2) + 20;
				var currentY = relativeCoords(canvas, child).y + childHeight / 2;
				if (currentY < desiredY) {
					var size = Math.min(desiredY - currentY, space);
					child.before("<div class='annotation-spacer' style='height:" + size + "px'></div>");
					space = space - size;
				}
			});
		}
		annotationContainer.children('.annotation').each(function() {
			var child = $(this);
			var margin = 10;
			var childHeight = child.outerHeight(true);
			var id = child.attr("annotation-id");
			var coords = relativeCoords(canvas, child);
			if (coords.y >= (-childHeight) && coords.y <= backgroundHeight) {
				var region = regions[id];
				var anchorY = coords.y + (childHeight / 2);
				if (coords.y + margin < region.y && coords.y - margin + (childHeight) > region.y) {
					anchorY = region.y;
				} else if (coords.y - margin + (childHeight) < region.y) {
					anchorY = coords.y + childHeight - margin;
				} else if (coords.y + margin > region.y) {
					anchorY = coords.y + margin;
				}
				if (anchorY > 0 && anchorY < backgroundHeight) {
					ctx.strokeStyle = region.colour;
					ctx.beginPath();
					ctx.moveTo(region.x, region.y);
					ctx.lineTo(coords.x, anchorY);
					ctx.closePath();
					ctx.stroke();
				}
				ctx.fillStyle = region.colour;
				ctx.fillRect(coords.x, coords.y, 25, Math.min(child.outerHeight(), backgroundHeight - coords.y));
			}
		});
	}

	function getLineHeight(e) {
		while (e != null && e.css("line-height").match(/\d+/) == null) {
			console.log(e);
			e = e.parent();
			console.log(e);
		}
		if (e == null) {
			return 0;
		}
		return parseInt(e.css("line-height").match(/\d+/)[0]);
	}

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
		var height = textContainer.outerHeight(true) - 20;
		canvas.get(0).height = height - 20;
		canvas.get(0).width = width;
		var ctx = canvas.get(0).getContext("2d");
		var leftMargin = 30;
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

			var lineHeight = getLineHeight($(this));
			var id = $(this).attr("annotation-id");
			// If we're right on the end of the line move the start coordinates to the
			// following
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

			var lineHeight = getLineHeight($(this));
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
			if (annotation.dynamic.colour) {
				ctx.fillStyle = annotation.dynamic.colour;
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
					// x : rightMargin,
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
				console.log("Semantics changed - re-rendering");
				model.set({
					cachedHTML : textus.markupText(model.get("text"), model.get("offset"), model.get("typography"),
							model.get("semantics"))
				});
				pageText.html(model.get("cachedHTML"));
				populateAnnotationContainer(model.get("semantics"), annotations, presenter);
				renderCanvas(pageCanvas, pageText, model.get("semantics"));
				renderLinks(pageText, linkCanvas, model.get("semantics"), annotations);
			});
			$('#nextPageButton', this.$el).click(function() {
				presenter.forward();
				return false;
			});
			$('#previousPageButton', this.$el).click(function() {
				presenter.back();
				return false;
			});
		},

		destroy : function() {
			var model = this.model = this.options.textModel;
			model.unbind("change:text");
			model.unbind("change:semantics");
			$(window).unbind("resize");
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