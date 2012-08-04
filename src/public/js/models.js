define([], function() {
	return {
		/*
		 * Hold the current logged in user record, used to determine whether certain UI components
		 * should be active
		 */
		loginModel : new (Backbone.Model.extend({
			defaults : {
				user : null,
				loggedIn : false,
				init : false
			}
		})),
		textModel : new (Backbone.Model.extend({
			defaults : {
				/* Text retrieved from the server */
				text : "",
				/* Offset of the first character in the retrieved text */
				offset : 0,
				/*
				 * Array containing typographical annotations which overlap with the retrieved text
				 */
				typography : [],
				/*
				 * Array containing semantic annotations which overlap with the retrieved text
				 */
				semantics : [],
				/*
				 * Used to cache the HTML version of the text, including marker spans for
				 * annotations etc.
				 */
				cachedHTML : null,
				/*
				 * Structure of the current text, the structure is an array of markers indicating
				 * structure boundary start points.
				 */
				structure : []
			}
		})),
		textSelectionModel : new (Backbone.Model.extend({
			defaults : {
				// The raw text captured by the selection
				text : "",
				// The location within the enclosing text of the
				// selected text.
				start : 0,
				// The location within the enclosing text of the end of
				// the selection (i.e. start + text.length assuming
				// there are no bugs!)
				end : 0
			}
		})),
		// The location model defines the current text and location
		// within that text
		textLocationModel : new (Backbone.Model.extend({
			defaults : {
				// Identifier of the text that should be rendered, if
				// this is null there is no text defined.
				textId : null,
				// The offset within the text which defines the range to
				// render.
				offset : 0,
			}
		}))
	};
});