define([ 'jquery', 'underscore', 'backbone' ], function($, _, Backbone) {

	// Defines the location of a selected region from a TextView
	var textSelectionModel = Backbone.Model.extend({

		defaults : {
			text : "",
			textId : "",
			fromChar : 0,
			toChar : 0
		},

	});

	return textSelectionModel;

});