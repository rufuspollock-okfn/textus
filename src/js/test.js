var colours = require('colors');
module.exports = exports = function() {

	var tests, lastTestName, lastTestStartTime, firstOutput;

	function elapsedTime() {
		return "(" + (Date.now() - lastTestStartTime) + "ms)";
	}

	function success(message) {
		console.log("\t" + lastTestName.yellow + " : " + (message ? message : "PASS").green + " " + elapsedTime()
				+ "\n\n");
		nextTest();
	}

	function fail(message) {
		console.log("\t" + lastTestName.yellow + " : " + (message ? message : "FAILED").red + " " + elapsedTime()
				+ "\n\n");
	}

	function nextTest() {
		if (tests.length == 0) {
			console.log("\nAll tests passed.".green);
			return;
		} else {
			var test = tests.shift();
			firstOutput = true;
			lastTestName = test.name;
			lastTestStartTime = Date.now();

			test();
		}
	}

	function checkFirstOutput() {
		if (firstOutput) {
			console.log("\t" + (lastTestName + "...").yellow);
			console.log("\t----------------------------------------------------------------------");
			firstOutput = false;
		}
	}

	return {
		run : function(testsToRun) {
			console.log("\nTests :");
			tests = testsToRun;
			nextTest();
		},
		success : success,
		fail : fail,
		json : function(o, message) {
			checkFirstOutput();
			if (message) {
				console.log("\t" + message.cyan);
			}
			console.log("\t" + JSON.stringify(o, null, 2).replace(/\n/g, '\n\t').magenta);
			console.log("\t----------------------------------------------------------------------");
		},
		print : function(message) {
			checkFirstOutput();
			console.log("\t" + message.cyan);
			console.log("\t----------------------------------------------------------------------");
		}
	};

};