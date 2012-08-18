/**
 * This file contains the logic required to work with the metadata document and extract TOC and
 * bibliographic references from it. It is used both from the client code and on the server, we
 * can't use JQuery here, all code in this module must be pure javascript with no dependencies!
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
};
define([], function() {

	/**
	 * A supplied object is empty if it is the empty string, an object consisting of empty
	 * properties, or a list of length 0 after all empty items are removed.
	 */
	function isEmpty(o) {
		console.log(JSON.stringify(o, null, 2));
		if (o === null) {
			return true;
		} else if (typeof o === 'string') {
			return o === '';
		} else if (o instanceof Array) {
			return o.filter(function(item) {
				return !(isEmpty(item));
			}).length === 0;
		} else {
			var allObjectPropsEmpty = true;
			for ( var prop in o) {
				if (o.hasOwnProperty(prop)) {
					if (!isEmpty(o[prop])) {
						allObjectPropsEmpty = false;
					}
				}
			}
			if (allObjectPropsEmpty) {
				return true;
			} else {
				return false;
			}
		}
		return false;
	}

	/**
	 * Merge any non-empty properties of the updates object into the current object, over-writing
	 * existing values. Returns the modified state of the current object, if this was null it will
	 * be set to a new empty object and then merged.
	 */
	function merge(current, updates) {
		if (current == null) {
			current = {};
		}
		if (updates == null) {
			return current;
		}
		for ( var prop in updates) {
			if (updates.hasOwnProperty(prop) && !isEmpty(updates[prop])) {
				current[prop] = updates[prop];
			}
		}
		return current;
	}

	/**
	 * @param metadata
	 *            a metadata object to parse
	 * @returns a set of functions acting on the parsed metadata
	 */
	return function(metadata) {

		var markers = [];
		for ( var markerName in metadata.markers) {
			if (metadata.markers.hasOwnProperty(markerName)) {
				var marker = metadata.markers[markerName];
				marker.index = parseInt(markerName.substring(6));
				markers.push(marker);
			}
		}
		markers.sort(function(a, b) {
			return a.index - b.index;
		});

		function bibJsonAt(index) {
			var result = {
				textus : {
					offset : index.toString()
				}
			};
			markers.forEach(function(marker) {
				if (marker.index <= index) {
					merge(result, marker.bibJson);
				}
			});
			return result;
		}

		return {

			/**
			 * Compute the derived BibJSON format citation at the supplied offset in the text
			 * described by the metadata object.
			 * 
			 * @param index
			 *            the index into the text for which the reference should be constructed.
			 * @returns a BibJSON object containing the aggregate state of all partial BibJSON
			 *          fragments from offset 0 to the supplied index.
			 */
			bibJsonAt : function(index) {
				return bibJsonAt(index);
			},

			/**
			 * Return all discoverable BibJSON objects as an array for this metadata document
			 */
			discoverableBibJson : function() {
				var result = [];
				markers.forEach(function(marker) {
					if (marker.discoverable) {
						console.log("Getting resolved entity at " + marker.index);
						result.push(bibJsonAt(marker.index));
					}
				});
				return result;
			}

		};

	};

});