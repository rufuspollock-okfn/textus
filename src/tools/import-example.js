/**
 * This file shows an example of how to import data into a textus instance,
 * including setting up searchable bibliographic metadata. The data and metadata
 * are hard-coded into the file itself, obviously in a real case you'd be
 * loading these in from some external source.
 */
var conf = require('../js/textusConfiguration.js').conf();
var ds = require('../js/datastore/dataStore-elastic.js')(conf);
var markers = require('../public/js/markers.js');

/**
 * This is the data type required by the datastore's import operation
 */
var data = {
	text : [ {
		/*
		 * You can chunk the text at this point using the sequence property to
		 * determine in which order the chunks should be combined. They must be
		 * contiguous or nothing will work properly!
		 */
		text : "This is the text to be imported",
		sequence : 0
	} ],
	typography : [ {
		/*
		 * Each typography annotation consists of a start and end point and a
		 * css class name which will be applied to the resultant span. These may
		 * nest but may not partially overlap.
		 */
		start : 0,
		end : 9,
		css : "styleName"
	} ],
	semantics : [ {
		/*
		 * Semantic annotations carry common metadata plus a payload dependent
		 * on the type of the annotation. This one is a free text comment which
		 * is probably the simplest type of semantic annotation we can have.
		 */
		user : "tomoinn@gmail.com",
		type : "textus:comment",
		payload : {
			text : "This is a comment"
		},
		start : 31,
		end : 39,
		visibility : "private"
	}, {
		/* This is a tag, the other type textus knows about at the moment. */
		user : "tomoinn@gmail.com",
		type : "textus:tag",
		payload : {
			name : "name",
			value : "value"
		},
		start : 31,
		end : 39,
		visibility : "private"
	} ]
};

/**
 * This is an example of a metadata document. The metadata document has three
 * roles: It determines the owners of the upload, those who will see it in their
 * upload list and who can modify the bibliographic information. It defines a
 * set of markers which contribute either or both of index information and
 * BibJSON markup.
 */
var metadata = {
	title : 'The title used in the upload list',
	markers : {
		// This marker applies at index 0
		marker0 : {
			label : 'start of the text',
			indexLevel : 0,
			discoverable : true,
			bibJson : {
				"title" : "Example import title",
				"author" : [ {
					"firstname" : "Firstname",
					"lastname" : "Lastname"
				} ],
				"year" : "Some year",
				"pages" : "1"
			}
		},
		// ...and this one at index 10
		marker10 : {
			// Label used in the index dropdown
			label : 'marker 2',
			// Value is >= 0 to appear in the index
			indexLevel : 1,
			// Discoverable set to false, marker doesn't appear in all texts
			// search view.
			disoverable : false,
			bibJson : {
			// Some BibJSON can go here
			}
		}
	},
	owners : [ 'someone@somewhere.com' ]
};

/**
 * Import a collection of data and metadata. The callback is a function taking
 * an error, which is null in the event of success, and a textId which is null
 * in the event of failure.
 */
function importStuff(data, metadata, callback) {
	/*
	 * Function to load the metadata and force regeneration of the bibliographic
	 * metadata, in this case by using the markers library to get all the
	 * reference objects which should be searchable
	 */
	function updateMetadata(textId, metadata, callback) {
		ds.updateTextMetadata(textId, metadata, function(err, data) {
			if (err) {
				callback(err);
			} else {
				var parsedMarkerSet = markers(data);
				var newRefs = parsedMarkerSet.discoverableBibJson();
				ds.replaceReferencesForText(textId, newRefs, function(err,
						response) {
					if (err) {
						callback(err);
					} else {
						callback(null);
					}
				});
			}
		});
	}
	ds.importData(data, function(err, textId) {
		if (err) {
			callback(err, null);
		} else {
			updateMetadata(textId, metadata, function(err) {
				if (err) {
					callback(err, null);
				} else {
					callback(null, textId);
				}
			});
		}
	});
}

/**
 * Run the import function on the data
 */
importStuff(data, metadata, function(err, textId) {
	if (err) {
		console.log("Failed to import!", err);
	} else {
		console.log("Imported text with id", textId);
	}
});
