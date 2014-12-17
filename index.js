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

	// Extend pooch onto a constuctor.
	Pooch.extend(constructor);

	// Save the reference to the promise implementation.
	Pooch.Promise = constructor;

	return Pooch;
};

/**
 * Add a reference to a Promise implementation so we
 * can swap in and out without any side effects.
 * @type {Function}
 */
Pooch.Promise = typeof Promise !== "undefined" ? Promise : function() {
	throw new Error("No Promise implementation found. Use `pooch(MyPromiseLibrary)` or upgrade Node to v0.11.17.");
};

/**
 * Enable promise "skipping." This takes in a callback,
 * fullfils the returned promise and then ignores the
 * value. It passed into the next promise the value of
 * the root promise essentially just carrying it on.
 * An example would probably explain it better:
 *
 * @example
 * 	promiseReturns3().thenIgnore(function(value) {
 * 		console.log(value); // 3
 * 		return promiseReturns4(); // This would return 4
 * 	}).then(function(value) {
 * 		// Value is the value form promiseReturns3
 * 		console.log(value); // 3
 * 	});
 * 	
 * @param  {Function} callback Fullfill handler.
 * @return {Promise}
 */
Pooch.prototype.thenIgnore = function(callback) {
	if(!callback || typeof callback !== "function") throw new Error("#thenIgnore requires exactly one argument of type function.");

	var carry;
	return this.then(function(value) {
		carry = value;
		return callback(value);
	}).then(function() {
		return carry;
	});
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

	// Ignore the value of the conditional promise
	return this.thenIgnore(function(value) {
		// If the condition is true, fulfill it
		if(condition(value)) return callback(value);
		else return; // Otherwise, ignore
	});
};

/**
 * Execute a promise while a condition returns true;
 *
 * @example
 *
 * 	var i = 0;
 *
 *  myPromise().thenWhile(function() {
 *  	return i <= 10;
 *  }, function(value) {
 *  	// `value` is the value from myPromise()
 *  	i++;
 *
 *      return myOtherPromise();
 *  }).then(function() {
 *  	console.log(i); // 10
 *  });
 *  
 * @param  {Function} condition See Promise#thenIf <condition> argument.
 * @param  {Function} callback  The callback you would pass to #then.
 * @return {Promise}
 */
Pooch.prototype.thenWhile = function(condition, callback) {
	var self = this;

	// If the condition is true
	return this.thenIf(condition, function() {
		// Run the callback, ignore it's value and recur
		return self.thenIgnore(callback).thenWhile(condition, callback)
	});
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

// Expose all the static functions on the Pooch object to enable
// chaining from the Pooch object. For example:
// 		Pooch.thenIf( <cond>, <callback> ).then( ... )
// All this does is create a method on the Pooch object
// that returns a promise that *always* fulfills. It's
// basically a noop that enables chaining.
// 
// We add "then" for a special case so Pooch.then( ... )
// is legal.
Object.keys(Pooch.prototype).concat(["then"]).forEach(function(method) {
	Pooch[method] = function() {
		return (new Pooch.Promise(function(resolve) { resolve(); }));
	};
});

// And export Pooch.
module.exports = Pooch;