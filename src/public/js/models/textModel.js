define([ 'jquery', 'underscore', 'backbone' ], function($, _, Backbone) {

	// Defines a simple location within a text consisting of start and end
	// coordinates defaulting to 0,0 along with the plain un-marked text at that
	// location fetched from the server.
	var textModel = Backbone.Model.extend({

		defaults : {
			text : "",
			start : 0,
			end : 0,
			annotations : [],
			textId : ""
		},

		/**
		 * 
		 * @param start
		 *            index of the first character in the text to render as an
		 *            absolute position within the parent text. 0 would mean
		 *            'render from the start of the text'.
		 * @param text
		 *            the text to render.
		 * @param annotations
		 *            array of annotations to be applied to the text to produce
		 *            HTML markup. Each annotation consists of { start, end, css }
		 *            and is used to create a SPAN element spanning the matching
		 *            text range and assigning the specified class.
		 * @param textId
		 *            the ID of the text
		 */
		changeValues : function(start, text, annotations, textId) {
			var newAnnotations = annotations.sort(function(a, b) {
				return a.start - b.start;
			});
			var _end = start + text.length;
			newAnnotations.forEach(function(item) {
				item.start = Math.max(item.start, start);
				item.end = Math.min(item.end, _end);
			});
			this.set({
				start : start,
				end : _end,
				text : text,
				// Sort annotations by start index and clip to range of text
				annotations : newAnnotations,
				textId : textId
			});
		}

	});

	return textModel;

});