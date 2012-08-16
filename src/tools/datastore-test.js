var conf = require('../js/textusConfiguration.js').conf();
var ds;
var test = require('../js/test.js')();

test.run([

function createDataStore() {
	ds = require('../js/datastore/dataStore-elastic.js')(conf);
	test.success();
},

function storeRefs() {
	test.json(conf);
	test.json(conf,"This is the configuration");
	test.success("Hello!");
},

function test2() {
	test.print("Always fails");
	test.fail();
}

]);
