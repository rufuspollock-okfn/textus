define([ 'text!templates/snippetView.html', 'textus' ], function(layout, textus) {

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