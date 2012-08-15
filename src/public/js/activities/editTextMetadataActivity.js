define([ 'textus', 'views/editTextMetadataView' ], function(textus, View) {

	var setReviewSize = function() {
		$('#textPanel').height($(window).height() - $('#textPanel').offset().top - 40);
	};

	return function(textId) {

		this.name = "EditTextMetadataActivity";

		this.pageTitle = "Text Metadata";

		this.start = function() {
			var view = new View({
				presenter : {
					saveMetadata : function(newMetadata) {
						$.ajax({
							url : "api/meta/" + textId,
							type : "POST",
							data : JSON.stringify(newMetadata),
							dataType : "json",
							contentType : "application/json; charset=utf-8",
							success : function(data) {
								view.setMetadata(data);
							}
						});
					},
					resetMetadata : function() {
						$.getJSON("api/meta/" + textId, function(meta) {
							view.setMetadata(meta);
						});
					}
				},
				el : $('#main')
			});
			view.render();
			$.getJSON("api/meta/" + textId, function(meta) {
				$.getJSON("api/completeText/" + textId, function(data) {
					view.setText(data.text, data.typography);
					view.setMetadata(meta);
				});
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