// Router, loads appropriate pages based on target URL
define(
		[ 'jquery', 'underscore', 'backbone', 'views/appView', 'views/textView' ],
		function($, _, Backbone, AppView, TextView) {

			var models = {
				textModel : new (Backbone.Model.extend({
					defaults : {
						text : "",
						offset : 0,
						typography : [],
						semantics : []
					}
				})),
				textSelectionModel : new (Backbone.Model.extend({
					defaults : {
						text : "",
						start : 0,
						end : 0
					}
				}))
			};

			/**
			 * Router defined here, add client-side routes here to handle
			 * additional pages and manage history sensibly.
			 */
			var AppRouter = Backbone.Router.extend({

				routes : {
					// Routes for pages go here
					'/text/:textid/:startindex' : 'text',
					'*actions' : 'defaultActions'
				},

				// Location for reading texts
				text : function(textId, startIndex) {
					$.getJSON("mock-data/alice-in-wonderland.txt.json",
							function(data) {
								models.textModel.set({
									text : data.text,
									offset : data.offset,
									typography : data.typography,
									semantics : data.semantics
								});
								var textView = new TextView({
									textModel : models.textModel,
									presenter : {
										handleTextSelection : function(start,
												end, text) {
											models.textSelectionModel.set({
												start : start,
												end : end,
												text : text
											});
										}
									}
								});
								textView.render();
							});
				},

				defaultActions : function() {
					var appView = new AppView();
					appView.render();
				}

			});

			return {
				initialize : function() {
					_.bindAll(this);
					var s = models.textSelectionModel;
					s.bind("change", function(event) {
						if (s.get("text") != "") {
							alert("Text selected '" + s.get("text")
									+ "' character range [" + s.get("start")
									+ "," + s.get("end") + "]");
						}
					});
					new AppRouter();
					Backbone.history.start();
				}
			};

		});