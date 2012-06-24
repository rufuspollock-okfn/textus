/**
 * Module to reference all possible parsers, contains a single object where keys are named formats
 * and values are the functions of import_format -> object ready to bulk load into the data store.
 */
module.exports = exports = {

	wikitext : require("./wikitext-parser.js")

};