var requirejs = require('requirejs');
var conf = require('../js/textusConfiguration.js').conf({
	esIndex : "textus-test"
});
var ds;

requirejs.config({
	// Pass the top-level main.js/index.js require
	// function to requirejs so that node modules
	// are loaded relative to the top-level JS file.
	nodeRequire : require
});

var prefix = "aaaAaa";

requirejs([ '../public/js/markers.js' ], function(markers) {
	var test = require('../js/test.js')();
	/**
	 * Simple callback used for datastore objects which expect a callback taking a single 'err'
	 * argument which is null in cases of success and non-null to indicate failure.
	 */
	function checkErrorCallback(err) {
		if (err) {
			test.fail(err);
		} else {
			test.success();
		}
	}

	/**
	 * Build a test BibJSON object with an author, title and a textus block with a textId =
	 * 'text'+index and role specified by the role argument.
	 */
	function ref(index, role) {
		return {
			author : "author" + index,
			title : "title" + index,
			textus : {
				textId : prefix + index,
				role : role
			}
		};
	}

	/**
	 * Use the test runner to initialise the data store, clear the data in the textus-test index,
	 * then exercise various functions of the datastore object.
	 */
	test.run([

	/**
	 * Create the datastore object
	 */
	function createDataStore() {
		ds = require('../js/datastore/dataStore-elastic.js')(conf);
		ds.init(checkErrorCallback);
	},

	/**
	 * Clear the index, recreating it
	 */
	function clearIndex() {
		ds.clearIndex(checkErrorCallback);
	},

	/**
	 * Store a bunch of bibliographic references
	 */
	function storeRefs() {
		var refs = [ ref(1, 'text'), ref(2, 'text'), ref(3, 'text'), ref(1, 'list') ];
		test.json(refs);
		ds.storeBibliographicReferences(refs, checkErrorCallback);
	},

	/**
	 * Check that we can retrieve the one reference with textus.role='text' and
	 * textus.textId='text1'
	 */
	function retrievePreviouslyStoredRefsForTextID() {
		ds.getBibliographicReferences(prefix + "1", function(err, result) {
			test.json(result);
			if (err) {
				test.fail(err);
				return;
			}
			if (result.length != 1) {
				test.fail("Should have one result in list, had " + result.length);
				return;
			}
			if (result[0].author != "author1") {
				test.fail("Retrieved wrong reference!");
				return;
			}
			test.success();
		});
	},

	/**
	 * Re-write the references for text1 and check the results are sensible
	 */
	function testReplaceReferences() {
		ds.replaceReferencesForText(prefix + "1", [ {
			title : 'newTitle1',
			textus : {
				'offset' : '0'
			}
		}, {
			title : 'newTitle2',
			textus : {
				'offset' : '1000'
			}
		} ], function(err, res) {
			if (err) {
				test.fail(err);
			} else {
				ds.getBibliographicReferences(prefix + "1", function(err, result) {
					if (err) {
						test.fail(err);
					} else {
						if (result.length === 2) {
							test.success();
						} else {
							test.fail("Wrong number of results - should have been 2, was " + result.length);
						}
					}

				});
			}
		});
	}

	]);
});
