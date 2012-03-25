// Defines TextView

define([ 'jquery', 'underscore', 'backbone', 'textus',
		'text!templates/textView.html' ], function($, _, Backbone, textus,
		layout) {

	/**
	 * Populate the text area and canvas elements
	 */
	var renderText = function(canvas, textContainer, text, offset, typography,
			semantics) {
		// Set the HTML content of the text container
		textContainer.html(textus.markupText(text, offset, typography,
				semantics));
		// Need to do stuff [tm] with the canvas here...
		console.log("Rendering text '" + text + "' at offset " + offset
				+ " with typography " + typography + " and semantics "
				+ semantics + " into text container " + textContainer
				+ " and using canvas " + canvas);
	};

	var TextView = Backbone.View.extend({

		render : function(event) {
			var el = $('.main').html(layout);
			el.unbind("mouseup");
			el.bind("mouseup", this.defineSelection);
			if (this.model) {
				console.log("Using model " + this.model);
				renderText($('#pageCanvas'), $('.pageText'), this.model.text,
						this.model.offset, this.model.typography,
						this.model.semantics);
			}
		},

		// Attempt to get the selected text range, after
		// trimming any markup
		defineSelection : function() {
			var userSelection = "No selection defined!";
			if (window.getSelection && this.presenter && this.model) {
				userSelection = window.getSelection();
				fromChar = parseInt(userSelection.anchorNode.parentNode
						.getAttribute("offset"))
						+ parseInt(userSelection.anchorOffset);
				toChar = parseInt(userSelection.focusNode.parentNode
						.getAttribute("offset"))
						+ parseInt(userSelection.focusOffset);
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