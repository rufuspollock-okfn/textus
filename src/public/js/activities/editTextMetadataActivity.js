define([ 'textus', 'views/editTextMetadataView' ], function(textus, View) {

	var setReviewSize = function() {
		$('#textPanel').height($(window).height() - $('#textPanel').offset().top - 40);
	};

	return function(textId) {

		this.name = "EditTextMetadataActivity";

		this.pageTitle = "Text Metadata";

		this.start = function() {
			console.log("Edit Text Metadata activity started for ID " + textId);
			var view = new View({
				presenter : {
					saveMetadata : function(newMetadata) {
					},
					resetMetadata : function() {
					}
				},
				el : $('#main')
			});
			view.render();
			$.getJSON("api/completeText/" + textId, function(data) {
				view.setText(data.text, data.typography);
			});
			$('a[data-toggle=tab]').on('shown', function(e) {
				setReviewSize();
			});

			$(window).resize(setReviewSize);
			setReviewSize();
		};

		this.stop = function(callback) {
			$(window).unbind("resize");
			callback(true);
		};

	};
});