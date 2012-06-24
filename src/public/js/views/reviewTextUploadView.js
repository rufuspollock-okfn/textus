define([ 'jquery', 'underscore', 'backbone', 'form', 'text!templates/reviewTextUploadView.html',
		'views/editBibJsonView' ], function($, _, Backbone, Form, template, EditBibJsonView) {

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);

		},

		render : function() {
			$(this.el).html(template);
			var subView = new EditBibJsonView().render();
			$('#reviewContentDiv', this.el).html(subView.el);
			return this;
		}
	});

});