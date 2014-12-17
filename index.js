var util = require("util");

/*
 * Pooch method holder. The methods don't exactly
 * need to sit in it's prototype but convention,
 * habit and inheritance.
 *
 * This function will throw an error if instantiated
 * directly. It's for extending Pooch onto other 
 * Promise libraries and that's all.
 *
 * @param {Function} constructor See Pooch.extend.
 * @return {Pooch} Returns pooch so static methods and values are still accessible.
 */
var Pooch = function(constructor) {
	if(this instanceof Pooch) throw new Error("There is no need to instantiate Pooch directly.");

	// Extend pooch onto a constuctor
	Pooch.extend(constructor);

	return Pooch;
};

/**
 * Conditional promise execution. The value passed
 * to the ensuing promises after is the value from
 * the root promise. The #thenIf promise value is
 * ignored. The #thenIf promise is treated like a
 * blocking function which holds up the execution
 * of the promise chain if a condition is met and
 * has no effect on the values passed to the foll-
 * owing promises i.e.
 *
 * 	(new Promise(function(resolve) {
 * 		resolve(1);
 * 	})).thenIf(function() {
 *  	return true;
 * 	}, function() {
 * 		return new Promise(function(resolve) {
 * 			resolve("Hello world!");
 * 		}); 
 * 	}).then(function(value) {
 * 		console.log(value); // 1
 * 	});
 *
 * @example
 *
 * 	getUser().thenIf(function(user) {
 *  	return user.age > 18;
 * 	}, function(user) {
 * 		return makeUserAdult(user);
 * 	}).then(function(user) {
 * 		// The user from #getUser
 * 	});
 *
 * 
 * @param  {Function} condition Synchronous conditional callback where promise is run if it passes.
 *                              The value of the previous promise is passed as the first parameter.	
 * @param  {Function} callback  The callback you would pass to #then.
 * @return {Promise}
 */
Pooch.prototype.thenIf = function(condition, callback) {
	if(arguments.length !== 2) throw new Error("#thenIf requires one callback for the condition and another for the callback.");
	if(typeof condition !== "function" || typeof callback !== "function") throw new Error("#thenIf requires both the condition and callback to be functions.");

	// Return a new promise chained to the current one.
	var carry;
	return this.then(function(value) {
		carry = value;
		if(condition(value)) return callback(value);
		else return;
	}).then(function() {
		return carry;
	})
};

/**
 * Extend Pooch on a constructor. Useful for when
 * extending Promise libraries such as Bluebird.
 *
 * @example
 *
 * 	var Promise = require("bluebird"),
 * 		Pooch = require("pooch")(Promise);
 * 
 * @param  {Function} constructor
 */
Pooch.extend = function(constructor) {
	// util.inherits for some reason won't
	// work on native Promise object, so we have
	// to do the extension manually.
	// util.inherits(constructor, Pooch) NOPE
	
	for(var method in Pooch.prototype)
		if(Pooch.prototype.hasOwnProperty(method))
			constructor.prototype[method] = Pooch.prototype[method];
};

// If native Promises exist, extend them automatically.
if(typeof Promise !== "undefined") Pooch.extend(Promise);

// And export Pooch.
module.exports = Pooch;