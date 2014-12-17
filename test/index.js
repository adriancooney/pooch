var psync = require("../index.js"),
	assert = require("assert");

describe("Promise", function () {
	describe("#thenIf", function () {
		it("should conditionally execute a promise if a callback returns true.", function(done) {
			val(1).thenIf(function(value) {
				assert.equal(value, 1, "Value passed to condition is resolved value from previous promise.");
				return true;
			}, function(value) {
				return value + 1;
			}).then(function(value) {
				assert.equal(value, 1, "Conditional promise has not changed value.");
			}).then(done).catch(done);
		});

		it("should not execute a promise if a callback returns false.", function(done) {
			val(1).thenIf(function(value) {
				return false;
			}, function(value) {
				done("Condition executed when it should not have been.");
			}).then(function(value) {
				assert.equal(value, 1, "Conditional promise has not changed value.");
			}).then(done).catch(done);
		});

		it("should handle exceptions within the coniditional promise.", function(done) {
			val(1).thenIf(function(value) {
				return true;
			}, function(value) {
				throw new Error("Oh no!");
			}).then(done.bind(null, "The ensuing promise was executed when it should not have been."))
			  .catch(done.bind(null, null));
		});

		it("should throw an error if either parameter is not a function", function() {
			assert.throws(function() {
				val().thenIf(true, function() {});
			}, "Conditional is not a function.");

			assert.throws(function() {
				val().thenIf(function() {}, true);
			}, "Callback is not a function.");
		});

		it("should throw an error if not exact parameters are given", function() {
			assert.throws(function() {
				val().thenIf();
			}, "#thenIf is passed no arguments.");
		});
	});
});		

function val(value) {
	return new Promise(function(resolve) { resolve(value); });
}