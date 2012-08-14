define([], function() {

	return {

		/**
		 * Create and display the modal dialogue.
		 * 
		 * @param modal
		 *            an object containing two functions, firstly one which is called with the
		 *            parent element for the dialogue and which should populate the dialogue prior
		 *            to display, and the second which is optional and will be called when the user
		 *            has clicked outside the dialogue and wishes to close it. The signature of the
		 *            two functions are :
		 *            <p>
		 *            modal.constructor : function(jQueryElement, function()):void - the second
		 *            function argument is a function which can be called to close the dialogue.
		 *            <p>
		 *            modal.beforeClose : function():boolean - a function which will be called
		 *            immediately before closing the dialogue due to a user click event on the glass
		 *            pane behind it, returning false from this function vetoes the close event.
		 *            <p>
		 *            modal.position : Optional, if specified should be one of
		 *            [right|left|bottom|top|on] to specify where the modal should be positioned
		 *            relative to the target element which triggered the opening. If not specified
		 *            open at the event coordinates.
		 * @param event
		 *            used to position the modal dialogue based on the value of modal.position - if
		 *            not specified the modal is positioned in the centre of the window.
		 */
		showModal : function(modal, event) {
			var glass = $('#modalGlassPane');
			var modalPad = 4;
			var escapeListener = function(event) {
				if (event.keyCode == 27) {
					hideGlass();
				}
			};
			$(document.documentElement).keyup(escapeListener);
			if (glass.is(':visible')) {
				console.log("Warning - modal panel already visible, can't display again.");
				return;
			}

			glass.append('<div id="modalDialogue" class="textus-modal ui-draggable">'
					+ '<div class="textus-modal-header"></div>'
					+ '<div class="textus-modal-contents" id="modalDialogueContents"></div></div>');
			var dialogue = $('#modalDialogue');
			var contents = $('#modalDialogueContents');
			var header = $('.textus-modal-header');
			dialogue.draggable({
				handle : header,
				containment : "window"
			});
			var hideGlass = function() {
				$(document.documentElement).unbind('keyup', escapeListener);
				glass.unbind('click');
				glass.empty();
				glass.hide();
			};
			contents.empty();
			glass.click(function(event) {
				if (event.target.id == "modalGlassPane" && (!modal.beforeClose || modal.beforeClose())) {
					hideGlass();
				}
				return false;
			});
			contents.empty();
			modal.constructor(contents, header, hideGlass);

			glass.show();
			if (event) {
				var target = $(event.currentTarget);
				if (!modal.position) {
					dialogue.css('top', (event.pageY) + 'px');
					dialogue.css('left', (event.pageX) + 'px');
				} else if (modal.position == 'right') {
					dialogue.css('top', target.offset().top + 'px');
					dialogue.css('left', (target.offset().left + target.outerWidth()) + modalPad + 'px');
				} else if (modal.position == 'bottom') {
					dialogue.css('top', (target.offset().top + target.outerHeight()) + modalPad + 'px');
					dialogue.css('left', target.offset().left + 'px');
				} else if (modal.position == 'top') {
					dialogue.css('top', (target.offset().top - modalPad - dialogue.outerHeight()) + 'px');
					dialogue.css('left', target.offset().left + 'px');
				} else if (modal.position == 'left') {
					dialogue.css('top', target.offset().top + 'px');
					dialogue.css('left', (target.offset().left - dialogue.outerWidth() - modalPad) + 'px');
				} else if (modal.position == 'over') {
					dialogue.css('top', target.offset().top + 'px');
					dialogue.css('left', target.offset().left + 'px');
				}
			} else {
				/* Event not specified, open dialogue in centre of page */
				dialogue.css('left', ($(window).width() - dialogue.outerWidth()) / 2 + 'px');
				dialogue.css('top', ($(window).height() - dialogue.outerHeight()) / 2 + 'px');
			}
			/* If there are form elements give the first one focus */
			$(':input:visible:first', contents).focus();
		},

		/**
		 * Tag names which, when encountered as css in typographical annotation, will be converted
		 * directly to the equivalent HTML tags rather than as spans with the appropriate name
		 */
		knownTagNames : [ "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li" ],

		/**
		 * Simple range overlap check
		 */
		overlapsRange : function(startA, endA, startB, endB) {
			return (endB > startA) && (startB < endA);
		},

		/**
		 * Render a piece of text and sets of typographical and semantic annotations to HTML.
		 * Typographical annotations are rendered to spans with the appropriate css style, semantic
		 * ones to pairs of empty spans indicating the start and end points of each annotation.
		 * Typographical annotations may nest but may not overlap, so two annotations with start and
		 * end pairs [0,10] and [2,5] would be allowed, but [0,10] and [4,14] wouldn't render
		 * correctly. In these cases the effect would be to produce two spans of [0,14] and [4,10],
		 * it is the responsibility of the data provider to ensure that this doesn't happen.
		 * 
		 * @param text
		 *            The plain text to render.
		 * @param textOffset
		 *            The index of the first character in the supplied text relative to the entire
		 *            document from which it is extracted. This is used to transform the absolute
		 *            positions of annotations into relative positions within this particular piece
		 *            of text.
		 * @param typography
		 *            Array of typography annotation objects, each of which takes the form
		 *            {start:int, end:int, css:string}. The start and end values are the absolute
		 *            character indices relative to the root of the document to which the annotation
		 *            applies, and the css property the CSS style which should be set on the
		 *            resultant span element.
		 * @param semantics
		 *            Array of semantic annotation objects, each of which must include at least the
		 *            following properties: {start:int end:int id:string}. Start and end are
		 *            interpreted as for the typographical annotations, and the id is the unique
		 *            identifier for this particular semantic annotation. Any other properties will
		 *            be ignored. These objects are used to inject empty spans at both start and end
		 *            points of the annotation, these spans are then used by the renderer to obtain
		 *            the coordinates in screen space of the annotation boundaries.
		 * @returns A string containing HTML with the appropriate spen elements inserted.
		 */
		markupText : function(text, textOffset, typography, semantics) {
			// Filter and adjust offsets for annotations
			var tags = [];
			// Function to check whether two ranges overlap
			var overlapsRange = this.overlapsRange;
			var knownTagNames = [ "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li" ];
			// Add semantic annotations to the pool of tags
			semantics.forEach(function(annotation) {
				if (overlapsRange(textOffset, textOffset + text.length, annotation.start, annotation.end)) {
					// Create span for annotation start point
					tags
							.push({
								pos : (Math.max((annotation.start - textOffset), 0)),
								tag : "<span class=\"textus-annotation-start\" annotation-id=\"" + annotation.id
										+ "\"></span>",
								order : 3
							});
					/*
					 * And a similar span for the annotation end point
					 */
					tags.push({
						pos : (Math.min((annotation.end - textOffset), text.length)),
						tag : "<span class=\"textus-annotation-end\" annotation-id=\"" + annotation.id + "\"></span>",
						order : 0
					});
				}
			});
			/*
			 * Add span tag opening and closing parts to the pool of tags
			 */
			typography.forEach(function(annotation) {
				if (overlapsRange(textOffset, textOffset + text.length, annotation.start, annotation.end)) {
					var tagName = "span";
					var tagNameIndex = 0;
					var tagPriority = 0;
					knownTagNames.forEach(function(candidateTagName) {
						if (candidateTagName == annotation.css) {
							tagName = candidateTagName;
							tagPriority = tagNameIndex;
						}
						tagNameIndex++;
					});
					tags.push({
						pos : (Math.max((annotation.start - textOffset), 0)),
						tag : "<" + tagName + " offset=\""
								+ (Math.max((annotation.start - textOffset), 0) + textOffset) + "\" class=\""
								+ annotation.css + "\">",
						order : 2,
						endpos : (Math.min((annotation.end - textOffset), text.length)),
						tagPriority : tagPriority
					}, {
						pos : (Math.min((annotation.end - textOffset), text.length)),
						tag : "</" + tagName + ">",
						order : 1,
						tagPriority : tagPriority
					});
				}
			});
			/*
			 * Sort tags by position then order, ensures that the semantic annotations end up inside
			 * the typographical ones where there's the potential for this to happen otherwise.
			 */
			tags.sort(function(a, b) {
				if (a.pos != b.pos) {
					return a.pos - b.pos;
				} else {
					if (a.order != b.order) {
						return a.order - b.order;
					} else {
						if (a.endpos != null && b.endpos != null) {
							if (b.endpos == a.endpos) {
								if (a.tagPriority != null && b.tagPriority != null) {
									return a.tagPriority - b.tagPriority;
								}
							} else {
								if (b.endpos == a.endpos) {
									if (a.tagPriority != null && b.tagPriority != null) {
										return b.tagPriority - a.tagPriority;
									}
								}
								return b.endpos - a.endpos;
							}
						}
						return 0;
					}
				}
			});
			/*
			 * Quick function to replace angled brackets with their HTML literal equivalents.
			 */
			var stripBrackets = function(string) {
				return string.replace("<", "&lt;", "g").replace(">", "&gt;", "g");
			};
			var result = [];
			var cursorIndex = 0;
			/*
			 * Push each tag to the result, inserting the wrapped text where appropriate.
			 */
			tags.forEach(function(tag) {
				if (tag.pos > cursorIndex) {
					result.push("<span offset=\"" + (cursorIndex + textOffset) + "\">");
					result.push(stripBrackets(text.substring(cursorIndex, tag.pos)));
					result.push("</span>");
					cursorIndex = tag.pos;
				}
				result.push(tag.tag);
			});
			if (cursorIndex < text.length) {
				result.push("<span offset=\"" + (cursorIndex + textOffset) + "\">");
				result.push(stripBrackets(text.substring(cursorIndex, text.length)));
				result.push("</span>");
			}
			return result.join("") + " ";
		}
	};

});
