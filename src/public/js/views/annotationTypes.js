/**
 * Mapping for renderers and editors for different annotation types. Add new rendering functions and
 * editor schemas to this file to create new annotation types.
 */
define([ 'comment', 'tag' ].map(function(type) {
	return 'text!templates/annotations/' + type + '.html';
}), function(comment, tag) {

	return {

		/**
		 * A map of type -> function, the function being passed the annotation payload and returning
		 * HTML to represent that annotation.
		 */
		renderers : {
			'textus:comment' : _.template(comment),
			'textus:tag' : _.template(tag)
		},

		/**
		 * A map of type -> {name, schema} where the name is used in the UI for e.g. selection of
		 * which kind of annotation to create and the schema is a schema object used by the Backbone
		 * Forms library to create an editor for that annotation type. See
		 * https://github.com/powmedia/backbone-forms for more information on the forms schema
		 * syntax. The actual form layout is customised to use bootstrap's css in main.js during
		 * application startup.
		 */
		schemas : {
			"textus:comment" : {
				name : "Comment",
				schema : {
					"text" : "TextArea"
				}
			},
			"textus:tag" : {
				name : "Tag",
				schema : {
					"name" : "Text",
					"value" : "Text"
				}
			}
		}

	};

});