// Router, loads appropriate pages based on target URL
define(
		[ 'jquery', 'underscore', 'backbone', 'views/appView', 'views/textView' ],
		function($, _, Backbone, AppView, TextView) {

			var models = {
				textModel : {
					text : "",
					offset : 0,
					typography : [],
					semantics : []
				},
				textSelectionModel : Backbone.Model.extend({
					defaults : {
						text : "",
						textId : "",
						fromChar : 0,
						toChar : 0
					}
				})
			};

			var views = {
				textView : new (TextView.extend({
					model : models.textModel,
					selectionModel : models.textSelectionModel,
					initialize : function() {
						_.bindAll(this);
						this.selectionModel.bind("change", function(event) {
							sel = this.selectionModel;
							alert("Text selected '" + sel.get("text")
									+ "' character range ["
									+ sel.get("fromChar") + ","
									+ sel.get("toChar") + "]");
						});
					}
				})),
				appView : new AppView()
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
					$.getJSON("api/text/" + textId + "/" + startIndex,
							function(data) {
								console.log(data);
								views.textView.render();
							});
				},

				defaultActions : function() {
					console.log("Unregistered route");
					views.appView.render();
				}

			});

			return {
				initialize : function() {
					_.bindAll(this);
					new AppRouter();
					Backbone.history.start();
				}
			};

		});