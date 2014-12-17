var Pooch = require("../index.js"),
	assert = require("assert");

describe("Pooch", function () {
	it("should throw an error instantiating Pooch", function() {
		assert.throws(function() {
			new Pooch;
		}, "Pooch throwing an error when instantiating directly.");
	});

	it("should extend the prototype of a function", function () {
		var f = function() {};

		Pooch.extend(f);

		assert(f.prototype.thenIf, "Extended function has function from Pooch.");
	});

	it("should be extended onto the native promises, if any", function() {
		if(typeof Promise !== "undefined") {
			assert(Promise.prototype.thenIf, "Function has been extended onto native promises.");
		}
	});

	it("should have all methods within the prototype accessible statically for chaining.", function() {
		assert(Object.keys(Pooch.prototype).every(function(method) {
			return !!Pooch[method];
		}));
	});

	it("should enable chaining from the pooch object", function(done) {
		Pooch.thenIf(function() {
			return true;
		}, function() {
			return val(1);
		}).then(function() {
			return val(2)
		}).then(done.bind(null, null)).catch(done);
	});
});

describe("Promise", function () {
	describe("#thenIgnore", function () {
		it("should ignore the value of the second promise", function (done) {
			val(1).thenIgnore(function(value) {
				assert.equal(value, 1, "The value within the #thenIgnore fullfillment handler is 1.");
				return val(2);
			}).then(function(value) {
				assert.equal(value, 1, "The value within the ensuing #then fullfillment handler is 1 (unchanged).");
			}).then(done.bind(null, null)).catch(done);
		});

		it("should throw an error if incorrect arguments are given", function() {
			assert.throws(function() {
				val().thenIgnore(true);
			});
		});

		it("should throw an error if no arguments are given", function() {
			assert.throws(function() {
				val().thenIgnore();
			});
		});
	});

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
				done(new Error("Condition executed when it should not have been."));
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


	describe("#thenWhile", function () {
		it("should fulfill a promise while a condition returns true", function (done) {
			var calls = 0;
			val({ x: 1, foo: "bar" }).thenWhile(function(val) {
				return val.x <= 10;
			}, function(value) {
				calls++;
				value.x = value.x + 1;
				return val(2);
			}).then(function(value) {
				assert(value.foo === "bar", "The ensuing promise's value is that from the previous promise.");
				assert.equal(calls, 10, "The Promise#then has been called 10 times.");
			}).then(done.bind(null, null)).catch(done);
		});

		it("should not fulfull a promise when a condition is false", function(done) {
			val().thenWhile(function() {
				return false;
			}, function() {
				done(new Error("Promise was fullfilled when condition is false."));
			}).then(done).catch(done);
		});
	});
});		

function val(value) {
	return new Promise(function(resolve) { resolve(value); });
}