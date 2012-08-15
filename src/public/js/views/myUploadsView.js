define([ 'text!templates/myUploadsView.html' ], function(layout) {

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);
		},

		render : function() {
			$('.main').html(layout);
			return this;
		}

	});

});