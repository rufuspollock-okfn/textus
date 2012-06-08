/**
 * Provides the augmentAnnotations function and a set of painters to be used with it. Requires a
 * reference to the login module on construction.
 */
module.exports = exports = function(login) {

	var _augmentAnnotations = function(annotations, newAnnotations, painters, callback) {
		var annotation = annotations.pop();
		if (annotation) {
			if (annotation.user) {
				login.getUser(annotation.user, function(user) {
					painters.forEach(function(painter) {
						painter(annotation, user);
					});
					newAnnotations.push(annotation);
					_augmentAnnotations(annotations, newAnnotations, painters, callback);
				});
			} else {
				newAnnotations.push(annotation);
				_augmentAnnotations(annotations, newAnnotations, painters, callback);
			}
		} else {
			callback(newAnnotations);
		}
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
				if (user) {
					annotation.colour = "rgba(" + user.prefs.colour.red + "," + user.prefs.colour.green + ","
							+ user.prefs.colour.blue + ",0.2)";
				}
			}

		}

	};

};