define([ 'jquery', 'underscore', 'backbone', 'textus', 'text!templates/textFooterView.html' ], function($, _, Backbone,
		textus, layout) {

	return Backbone.View.extend({

		events : {
			"click #pageBackButton" : "back",
			"click #pageForwardButton" : "forward"
		},

		initialize : function() {
			_.bindAll(this);
			this.presenter = this.options.presenter;
			this.$el.html(layout);
		},

		back : function() {
			this.presenter.back();
		},

		forward : function() {
			this.presenter.forward();
		}

	});
});