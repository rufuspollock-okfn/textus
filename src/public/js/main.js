require.config({
	// Using the forked versions of Backbone and Underscore which support async
	// modules
	paths : {
		jquery : 'libs/jquery-1.7.1',
		underscore : 'libs/underscore-1.3.1-amd',
		json : 'libs/json2',
		backbone : 'libs/backbone-0.9.1-amd',
		text : 'libs/require-text-1.0.7',
		order : 'libs/require-order-1.0.7',
		templates : '../templates',
		form : 'libs/backbone-forms-0.9.0-amd',
		bootstrap : 'libs/bootstrap-2.0.4',
		jqueryui : 'libs/jquery-ui-1.8.21.custom.min',
		jquerylinkify : 'libs/jquery.linkify.1.0.0.min',
		jqueryfacetview : 'libs/jquery.facetview'
	},
	shim : {

	}
});

/**
 * Force load of jquery plugins
 */
require([ 'order!jquery', 'order!bootstrap', 'order!jqueryui', 'order!jquerylinkify', 'order!jqueryfacetview' ],
		function($) {
			//
		});

require([ 'router' ], function(Router) {
	Router.initialize();
});