// Router, loads appropriate pages based on target URL
define([ 'jquery', 'underscore', 'backbone' ], function($, _, Backbone) {
	var AppRouter = Backbone.Router.extend({
		routes : {
			// Routes for pages go here
			'/text/:textid/:startindex' : 'text',
			'*actions' : 'defaultActions'
		},
		// Location for reading texts
		text : function(textId, startIndex) {
			require([ 'views/textView' ], function(TextView) {
				console.log("Trying to switch to read texts...");
				var textView = new TextView();
				console.log("Got a textView "+textView);
				textView.render();
				textView.model.changeValues(startIndex,
						"This is some text with a decent number of characters "
								+ "and a couple of typographical annotations.",
						[ {
							start : 0,
							end : 10,
							css : "something"
						}, {
							start : 10,
							end : 60,
							css : "something-else"
						} ]);
			});
		},
		defaultActions : function() {
			console.log("Unregistered route");
		}
	});
	var initialize = function() {
		new AppRouter;
		console.log("Router created");
		Backbone.history.start();
	};
	return {
		initialize : initialize
	};
});