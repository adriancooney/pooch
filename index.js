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
Promise.prototype.thenIf = function(condition, callback) {
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