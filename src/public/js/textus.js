define(
		[ 'jquery', 'underscore', 'backbone' ],
		function($, _, Backbone) {

			return {

				overlapsRange : function(startA, endA, startB, endB) {
					return ((startA <= startB && endA >= endB)
							|| (startB <= startA && endB >= endA)
							|| (startB <= startA && endB >= startA) || (startB <= endA && endB >= endA));
				},

				/**
				 * Render a piece of text and sets of typographical and semantic
				 * annotations to HTML. Typographical annotations are rendered
				 * to spans with the appropriate css style, semantic ones to
				 * pairs of empty spans indicating the start and end points of
				 * each annotation. Typographical annotations may nest but may
				 * not overlap, so two annotations with start and end pairs
				 * [0,10] and [2,5] would be allowed, but [0,10] and [4,14]
				 * wouldn't render correctly. In these cases the effect would be
				 * to produce two spans of [0,14] and [4,10], it is the
				 * responsibility of the data provider to ensure that this
				 * doesn't happen.
				 * 
				 * @param text
				 *            The plain text to render.
				 * @param textOffset
				 *            The index of the first character in the supplied
				 *            text relative to the entire document from which it
				 *            is extracted. This is used to transform the
				 *            absolute positions of annotations into relative
				 *            positions within this particular piece of text.
				 * @param typography
				 *            Array of typography annotation objects, each of
				 *            which takes the form {start:int, end:int,
				 *            css:string}. The start and end values are the
				 *            absolute character indices relative to the root of
				 *            the document to which the annotation applies, and
				 *            the css property the CSS style which should be set
				 *            on the resultant span element.
				 * @param semantics
				 *            Array of semantic annotation objects, each of
				 *            which must include at least the following
				 *            properties: {start:int end:int id:string}. Start
				 *            and end are interpreted as for the typographical
				 *            annotations, and the id is the unique identifier
				 *            for this particular semantic annotation. Any other
				 *            properties will be ignored. These objects are used
				 *            to inject empty spans at both start and end points
				 *            of the annotation, these spans are then used by
				 *            the renderer to obtain the coordinates in screen
				 *            space of the annotation boundaries.
				 * @returns A string containing HTML with the appropriate spen
				 *          elements inserted.
				 */
				markupText : function(text, textOffset, typography, semantics) {
					// Filter and adjust offsets for annotations
					var tags = [];
					// Function to check whether two ranges overlap
					var overlapsRange = this.overlapsRange;
					// Add semantic annotations to the pool of tags
					semantics
							.forEach(function(annotation) {
								if (overlapsRange(textOffset, textOffset
										+ text.length, annotation.start,
										annotation.end)) {
									// Create span for annotation start point
									tags
											.push({
												pos : (Math
														.max(
																(annotation.start - textOffset),
																0)),
												tag : "<span class=\"textus-annotation-start\" annotation-id=\""
														+ annotation.id
														+ "\"></span>",
												order : 3
											});
									// And a similar span for the annotation end
									// point
									tags
											.push({
												pos : (Math
														.min(
																(annotation.end - textOffset),
																text.length)),
												tag : "<span class=\"textus-annotation-end\" annotation-id=\""
														+ annotation.id
														+ "\"></span>",
												order : 0
											});
								}
							});
					// Add span tag opening and closing parts to the pool of
					// tags
					typography
							.forEach(function(annotation) {
								if (overlapsRange(textOffset, textOffset
										+ text.length, annotation.start,
										annotation.end)) {

									tags
											.push(
													{
														pos : (Math
																.max(
																		(annotation.start - textOffset),
																		0)),
														tag : "<span offset=\""
																+ (Math
																		.max(
																				(annotation.start - textOffset),
																				0) + textOffset)
																+ "\" class=\""
																+ annotation.css
																+ "\">",
														order : 2
													},
													{
														pos : (Math
																.min(
																		(annotation.end - textOffset),
																		text.length)),
														tag : "</span>",
														order : 1
													});
								}
							});
					// Sort tags by position then order, ensures that the
					// semantic
					// annotations
					// end up inside the typographical ones where there's the
					// potential
					// for this
					// to happen otherwise.
					tags.sort(function(a, b) {
						if (a.pos != b.pos) {
							return a.pos - b.pos;
						} else {
							return a.order - b.order;
						}
					});
					// Quick function to replace angled brackets with their HTML
					// literal
					// equivalents.
					var stripBrackets = function(string) {
						return string.replace("<", "&lt;", "g").replace(">",
								"&gt;", "g");
					};
					var result = [];
					var cursorIndex = 0;
					// Push each tag to the result, inserting the wrapped text
					// where
					// appropriate.
					tags.forEach(function(tag) {
						if (tag.pos > cursorIndex) {
							result.push(stripBrackets(text.substring(
									cursorIndex, tag.pos)));
							cursorIndex = tag.pos;
						}
						result.push(tag.tag);
					});
					if (cursorIndex < text.length) {
						result.push(stripBrackets(text.substring(cursorIndex,
								text.length)));
					}
					return result.join("")+" ";
				}
			};

		});
