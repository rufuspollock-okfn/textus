define([ 'textus', 'views/snippetView', 'markers' ], function(textus, View, markers) {

	function sortAndRemoveDuplicates(l) {
		l.sort(function(a, b) {
			return a - b;
		});
		var result = [];
		l.forEach(function(i) {
			if (result.length == 0) {
				result.push(i);
			} else {
				if (result[result.length - 1] != i) {
					result.push(i);
				}
			}
		});
		return result;
	}

	/**
	 * @TODO - this is inefficient, should really move the range extension logic into the server to
	 *       prevent the large number of round trips. The algorithm is that the initial start and
	 *       end offsets are used to retrieve the text. The range is then extended by finding the
	 *       minimum and maximum of the extents of all typographical annotations which apply,
	 *       extending that range by 1 in each direction the repeating the process. This therefore
	 *       will retrieve the paragraph in which the text is contained as well as the ones
	 *       immediately before and after to provide context to the selected fragment.
	 */
	return function(textId, startOffset, endOffset, router) {

		this.name = "SnippetActivity";

		this.pageTitle = "Text fragment";

		this.start = function() {
			var view = new View();
			view.render();
			$.getJSON("/api/text/" + textId + "/" + startOffset + "/" + endOffset, function(data) {
				/*
				 * Find the new bounds of the text to render based on the max and minimum
				 * typographical annotation extends
				 */
				var start = startOffset, end = endOffset;
				data.typography.forEach(function(t) {
					start = Math.min(start, t.start);
					end = Math.max(end, t.end);
				});
				start = Math.max(0, start - 1);
				end++;
				$.getJSON("/api/text/" + textId + "/" + start + "/" + end, function(data) {
					var start = startOffset, end = endOffset;
					data.typography.forEach(function(t) {
						start = Math.min(start, t.start);
						end = Math.max(end, t.end);
					});
					$.getJSON("/api/text/" + textId + "/" + start + "/" + end, function(data) {
						/* Insert extra annotations to highlight the selected text */
						var cutPoints = [ startOffset, endOffset ];
						data.typography.forEach(function(t) {
							cutPoints.push(t.end);
							cutPoints.push(t.start);
						});
						cutPoints = sortAndRemoveDuplicates(cutPoints);
						for (i = 0; i < cutPoints.length - 1; i++) {
							if (cutPoints[i] >= startOffset && cutPoints[i + 1] <= endOffset) {
								data.typography.push({
									start : cutPoints[i],
									end : cutPoints[i + 1],
									css : 'textus-highlight'
								});
							}
						}
						/* Retrieve bibliographic information for this location */
						$.getJSON("/api/meta/" + textId, function(metadata) {
							var bibJson = markers(metadata).bibJsonAt(startOffset);
							$('#snippet-text').html(
									textus.markupText(data.text, start, data.typography, data.semantics));
							$('#reader-button').click(function() {
								router.navigate("#text/" + textId + "/" + start, {
									trigger : true
								});
								return false;
							});
							$('#snippet-reference').html(textus.renderBibJson(bibJson));
						});

					});
				});
			});

		};

		this.stop = function(callback) {
			callback(true);
		};
	};
});