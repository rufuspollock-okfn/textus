define([ 'textus', 'text!templates/textFooterView.html' ], function(textus, layout) {

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