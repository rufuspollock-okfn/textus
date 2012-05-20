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
		form : 'libs/backbone-forms-0.9.0-amd'
	}
});

require([ 'router' ], function(Router) {
	Router.initialize();
});