$(document).ready(
		function() {
			var view = new TextView({
				model : new TextModel
			});
			view.model.changeValues(2,
					"This is some text with a decent number of characters "
							+ "and a couple of typographical annotations.", [ {
						start : 0,
						end : 10,
						css : "something"
					}, {
						start : 10,
						end : 60,
						css : "something-else"
					} ]);
		});

// Defines a simple location within a text consisting of start and end
// coordinates defaulting to 0,0 along with the plain un-marked text at that
// location fetched from the server.
var TextModel = Backbone.Model.extend({

	defaults : {
		text : "",
		start : 0,
		end : 0,
		annotations : []
	},

	/**
	 * 
	 * @param start
	 *            index of the first character in the text to render as an
	 *            absolute position within the parent text.
	 * @param end
	 *            index of the last character + 1 of the text to render.
	 * @param text
	 *            the text
	 * @param annotations
	 *            array of annotations to be applied to the text to produce HTML
	 *            markup. Each annotation consists of { start, end, css } and is
	 *            used to create a SPAN element spanning the matching text range
	 *            and assigning the specified class.
	 */
	changeValues : function(start, text, annotations) {
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
			annotations : newAnnotations
		});
	}

});

// View for the text model, just renders the contained text out via a template
var TextView = Backbone.View.extend({

	el : $('body'),

	initialize : function() {
		_.bindAll(this, 'render');
		this.model.bind("change", this.render);
	},

	render : function(event) {
		var _el = $(this.el).html("");
		var _model = this.model;
		var _start = _model.get("start");
		var _end = _model.get("end");
		var _cursor = _start;
		this.model.get("annotations").forEach(
				function(annotation) {
					// Append any plain text from the cursor to the start of the
					// annotation
					if (_cursor < annotation.start) {
						_el.append(_model.get("text").substring(
								_cursor - _start, annotation.start - _start));
					}
					_el.append("<span class=\""
							+ annotation.css
							+ "\">"
							+ _model.get("text").substring(
									annotation.start - _start,
									annotation.end - _start) + "</span>");
					_cursor = annotation.end;
				});
		_el.append(_model.get("text")
				.substring(_cursor - _start, _end - _start));
	}

});
