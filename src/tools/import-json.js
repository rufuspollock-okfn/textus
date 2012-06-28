/**
 * Import a text from a JSON document as defined in the import specification
 */
var fs = require('fs');
var args = require('optimist')
		.usage('Usage: $0 --title TITLE --file JSONFILE')
		.describe(
				'title',
				'Title to assign in the generated BibJSON (just temporary for now, will be done properly later)')
		.describe('file',
				'A JSON file containing text, typography, semantics and structure')
		.demand([ 'title', 'file' ]).argv;
// Textus configuration
var conf = require('../js/textusConfiguration.js').conf();
// Backend datastore, requires configuration
var ds = require('../js/datastore/dataStore-elastic.js')(conf);

var importData = JSON.parse(fs.readFileSync(args.file, 'utf8'));

if (!importData.structure) { importData.structure = []; }
if (!importData.semantics) { importData.semantics = []; }

ds.importData(importData, function(err, textId) {
	if (err) {
		console.log("Error!", err);
	} else {
		console.log("Stored text with text ID", textId);
		ds.storeBibliographicReferences([ {
			'title' : args.title,
			'textus' : {
				role : 'text',
				textId : textId,
				userId : 'auto-import'
			}
		} ], function(err) {
			if (err) {
				console.log("Unable to store references", err);
			} else {
				console.log("Success");
			}
		});
	}
});