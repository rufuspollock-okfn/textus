/**
 * Provides the augmentAnnotations function and a set of painters to be used with it. Requires a
 * reference to the login module on construction.
 */
module.exports = exports = function(login) {

	/**
	 * Private function to handle the asynchronous user fetch and application of painter functions.
	 */
	var _augmentAnnotations = function(annotations, newAnnotations, painters, callback) {
		var annotation = annotations.pop();
		if (annotation) {
			if (annotation.user) {
				login.getUser(annotation.user, function(response) {
					var user = response.success ? response.user : null;
					_paint(painters, annotation, user);
					newAnnotations.push(annotation);
					_augmentAnnotations(annotations, newAnnotations, painters, callback);
				});
			} else {
				_paint(painters, annotation, null);
				newAnnotations.push(annotation);
				_augmentAnnotations(annotations, newAnnotations, painters, callback);
			}
		} else {
			callback(newAnnotations);
		}
	};

	/**
	 * Apply the painters to the annotation, the user may be null if there is no user or the user
	 * cannot be looked up in the data store. Modifies the annotation object by creating or adding
	 * to the annotation.dynamic property.
	 */
	var _paint = function(painters, annotation, user) {
		if (!annotation.dynamic) {
			annotation.dynamic = {};
		}
		painters.forEach(function(painter) {
			var newProps = painter(annotation, user);
			for ( var name in newProps) {
				annotation.dynamic[name] = newProps[name];
			}
		});
	};

	return {

		/**
		 * Helper function, uses the login object to colour semantic annotations based on user
		 * preferences. Needs this function as everything is asynchronous, we can't simply iterate.
		 * There shouldn't be an issue with speed as the login object caches users.
		 * 
		 * @param annotations
		 *            an array of annotation objects to be painted
		 * @param painters
		 *            an array of functions f(annotation, user) called in turn for each annotation
		 *            and associated user (which may be null if no user can be matched to the
		 *            annotation's user ID field). The painter should add any appropriate properties
		 *            to the annotation object.
		 * @param callback
		 *            a function f(annotations) called with the array of new annotations on
		 *            completion.
		 */
		augmentAnnotations : function(annotations, painters, callback) {
			_augmentAnnotations(annotations.slice(), [], painters, callback);
		},

		/**
		 * Contains painter functions to be used with augmentAnnotations
		 */
		painters : {

			/**
			 * Colour the annotation based on the user preferences
			 * (user.prefs.colour.[red|green|blue])
			 */
			colourByUser : function(annotation, user) {
				// Use the user colour, or white if none specified.
				var c = user ? user.prefs.colour : {
					red : 255,
					green : 0,
					blue : 0
				};
				return {
					colour : "rgba(" + c.red + "," + c.green + "," + c.blue + ",0.2)"
				};
			}

		}

	};

};