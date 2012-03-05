// Defines TextView

define([ 'jquery', 'underscore', 'backbone', 'models/textModel' ], function($,
		_, Backbone, TextModel) {

	// View for the text model, just renders the contained text out via a
	// template
	var TextView = Backbone.View.extend({

		el : $('.page'),

		model : new TextModel(),

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
						// Append any plain text from the cursor to the
						// start of
						// the
						// annotation
						if (_cursor < annotation.start) {
							_el.append(_model.get("text")
									.substring(_cursor - _start,
											annotation.start - _start));
						}
						_el.append("<span class=\""
								+ annotation.css
								+ "\">"
								+ _model.get("text").substring(
										annotation.start - _start,
										annotation.end - _start) + "</span>");
						_cursor = annotation.end;
					});
			_el.append(_model.get("text").substring(_cursor - _start,
					_end - _start));
		}

	});

	return TextView;
});