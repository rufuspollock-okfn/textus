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

	var renderCanvas = function(canvas, textContainer, semantics) {
		var width = textContainer.outerWidth(true);
		var height = textContainer.outerHeight(true);
		// canvas.height(height).width(width);
		canvas.get(0).height = height;
		canvas.get(0).width = width;
		var ctx = canvas.get(0).getContext("2d");
		// Retrieve a list of all the elements corresponding to semantic
		// annotations, pair them up in a map containing all the coordinates and
		// identifiers. Regions are defined as {id:string, startx:int,
		// starty:int, startlh:int, endx:int, endy:int, endlh:int} and keyed on
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

		// Render all the regions...
		regionList.forEach(function(r) {
			// Retrieve the colour, if specified, for this region. In the full
			// system this will be derived from other properties of the
			// annotation but this will do for now. Defaults to red if colour
			// isn't available.
			var annotation = regions[r.id];
			if (annotation.colour) {
				ctx.fillStyle = annotation.colour;
			} else {
				ctx.fillStyle = "rgba(255,0,0,0.1)";
			}
			if (r.starty == r.endy) {
				// Check for a region where the annotation start and end points
				// are on the same line, in which case the rectangle is simple.
				ctx.fillRect(r.startx, r.starty, r.endx - r.startx, r.startlh);
			} else {
				// Otherwise draw rectangles from the start to the right margin
				// and from the left margin to the end.
				ctx.fillRect(leftMargin, r.endy, r.endx - leftMargin, r.endlh);
				ctx.fillRect(r.startx, r.starty, rightMargin - r.startx,
						r.startlh);
				if (r.starty + r.startlh < r.endy) {
					console.log(r);
					ctx.fillRect(leftMargin, r.starty + r.startlh, rightMargin
							- leftMargin, r.endy - (r.starty + r.startlh));
				}
			}
			// Draw in start and end points for annotations, just to make things
			// more obvious when they're going wrong!
			ctx.fillRect(r.startx, r.starty, 6, r.startlh);
			ctx.fillRect(r.endx - 6, r.endy, 6, r.endlh);
		});
	};

	/**
	 * Populate the text area
	 */
	var renderText = function(canvas, textContainer, text, offset, typography,
			semantics) {
		// Set the HTML content of the text container
		textContainer.html(textus.markupText(text, offset, typography,
				semantics));
		renderCanvas(canvas, textContainer, semantics);
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

	var TextView = Backbone.View.extend({

		render : function(event) {
			var el = $('.main').html(layout);
			el.unbind("mouseup");
			el.bind("mouseup", this.defineSelection);
			if (this.model) {
				renderText($('#pageCanvas'), $('.pageText'), this.model
						.get("text"), this.model.get("offset"), this.model
						.get("typography"), this.model.get("semantics"));
			}

		},

		initialize : function() {
			console.log(this.options);
			_.bindAll(this);
			this.model = this.options.textModel;
			this.presenter = this.options.presenter;
			this.selectionModel = this.options.selectionModel;
			var model = this.model;
			console.log("Model bound to "+model);
			$(window).resize(function() {
				if (true) {
					console.log("Resizing...");
					renderCanvas($('#pageCanvas'), $('.pageText'), model
							.get("semantics"));
				}
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
				var fromChar = parseInt(fromNode.parentNode
						.getAttribute("offset"))
						+ parseInt(userSelection.anchorOffset)
						+ offsetInParent(fromNode);
				var toChar = parseInt(toNode.parentNode.getAttribute("offset"))
						+ parseInt(userSelection.focusOffset)
						+ offsetInParent(toNode);
				this.presenter.handleTextSelection(fromChar, toChar, this.model
						.get("text").substring(fromChar, toChar));
			} else if (document.selection) {
				console.log("Fetching MS Text Range object (IE).");
				userSelection = document.selection.createRange();
			}
		}

	});

	return TextView;

});