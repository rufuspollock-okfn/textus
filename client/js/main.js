(function($) {
	console.log("Hello!");
	var MyView = Backbone.View.extend({
		el : $('body'),
		intialize : function() {
			console.log("Initializer called");
			_.bindAll(this, 'render');
			this.render();
		},
		render : function() {
			console.log("Rendering...");
			$(this.el).append("Loaded from JS");
		}
	});
	console.log("About to create view instance");
	var myview = new MyView;
	console.log("Created");
})(jQuery);