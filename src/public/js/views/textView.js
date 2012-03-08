// Defines TextView

define([ 'jquery', 'underscore', 'backbone', 'models/textModel',
		'models/textSelectionModel' ], function($, _, Backbone, TextModel,
		TextSelectionModel) {

	// View for the text model, just renders the contained text out via
	// a
	// template
	var TextView = Backbone.View.extend({

		model : new TextModel(),
		selectionModel : new TextSelectionModel(),

		initialize : function() {
			_.bindAll(this);
			this.model.on("change", this.render, this);
			_defineSelection = this.defineSelection;

		},

		render : function(event) {
			var el = $('.page').html("");
			el.unbind("mouseup");
			el.bind("mouseup", _defineSelection);
			var model = this.model;
			var start = model.get("start");
			var end = model.get("end");
			var cursor = start;
			var spanTag = this.spanTag;
			this.model.get("annotations").forEach(
					function(annotation) {
						// Append any plain text from
						// the cursor to the start of
						// the annotation
						if (cursor < annotation.start) {
							el.append(spanTag(cursor, start, null, model.get(
									"text").substring(cursor - start,
									annotation.start - start)));
						}
						if (annotation.end > cursor) {
							el.append(spanTag(cursor, start, annotation.css,
									model.get("text").substring(
											annotation.start - start,
											annotation.end - start)));
							cursor = annotation.end;
						}
					});
			el.append(this.spanTag(cursor, start, null, (model.get("text")
					.substring(cursor - start, end - start))));
		},

		// Emit a <span> tag with the appropriate 'offset' attribute and class
		spanTag : function(cursor, start, annotationClass, spanText) {
			return "<span "
					+ (annotationClass ? ("class=\"" + annotationClass + "\" ")
							: "") + " offset=\""
					+ Math.max(0, (cursor - start)) + "\">" + spanText
					+ "</span>";
		},

		// Attempt to get the selected text range, after
		// trimming any markup
		defineSelection : function() {
			var userSelection = "No selection defined!";
			if (window.getSelection) {
				userSelection = window.getSelection();
				fromChar = parseInt(userSelection.anchorNode.parentNode
						.getAttribute("offset"))
						+ parseInt(userSelection.anchorOffset);
				toChar = parseInt(userSelection.focusNode.parentNode
						.getAttribute("offset"))
						+ parseInt(userSelection.focusOffset);
				this.selectionModel.set({
					text : this.model.get("text").substring(fromChar, toChar),
					textId : this.model.get("textId"),
					fromChar : fromChar + parseInt(this.model.get("start")),
					toChar : toChar + parseInt(this.model.get("start"))
				});
			} else if (document.selection) {
				console.log("Fetching MS Text Range object (IE).");
				userSelection = document.selection.createRange();
			}
		}

	});

	return TextView;
});