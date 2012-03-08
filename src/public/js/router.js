// Router, loads appropriate pages based on target URL
define([ 'jquery', 'underscore', 'backbone', 'views/textView' ], function($, _,
		Backbone, TextView) {

	var AppRouter = Backbone.Router.extend({

		textView : new TextView(),

		routes : {
			// Routes for pages go here
			'/text/:textid/:startindex' : 'text',
			'*actions' : 'defaultActions'
		},

		// Location for reading texts
		text : function(textId, startIndex) {
			var textView = this.textView;
			$.getJSON("api/text/" + textId + "/" + startIndex, function(data) {
				textView.model.changeValues(data.start, data.text,
						data.annotations, textId);
				textView.render();
			});
		},

		defaultActions : function() {
			console.log("Unregistered route");
			$('.page').empty();
		}

	});

	var initialize = function() {
		var appRouter = new AppRouter;
		appRouter.textView.selectionModel.bind("change", function(event) {
			sel = appRouter.textView.selectionModel;
			alert("Text selected '" + sel.get("text") + "' from '"
					+ sel.get("textId") + "' character range ["
					+ sel.get("fromChar") + "," + sel.get("toChar") + "]");
		});
		Backbone.history.start();
	};

	return {
		initialize : initialize,
	};

});