# Pooch
Promise flow control similar to the popular [async](http://github.com/caolon/async) module.

### Installation
Install with npm

	$ npm install --save pooch
	
### Usage
Pooch works with all Promises that follow the ES6 Promise spec. To use on external libraries such as [bluebird](https://github.com/petkaantonov/bluebird/), just call `pooch` on the Promise object. You will only need to do this once since `require` caches objects.

With Node v0.11.17, just a simple `require("pooch")` will give you the functionality with native promises. Otherwise, you can extend an existing library:

	var Promise = require("bluebird"),
		Pooch = require("pooch")(Promise);


### Documentation

#### `Promise#thenIf( condition, callback )`
Conditional promise execution if a synchronous `condition` (with the value passed from the previous promise) returns true. The `condition` callback recieves one parameter, the value from the previously executed promise. The `callback` is the same callback you would pass to `Promise#then`. 

**NOTE:** Any value returned from the conditional promise is ignored. If the conditional promise is executed, it just holds up the promise execution chain and waits until it's complete. It has no affect on the ensuing values so any proceeding `#then` calls receive the value from the promise the `#thenIf` is attached to effectively skipping the conditional promise.

```js
getUser().thenIf(function(user) {
	return user.age > 18;
}, function(user) {
	return updatePrivacySettings(user);
}).then(function(user) {
	// The user from #getUser
	// Anything returned from updatePrivacySettings promise is ignored.
});
```

## Testing
Run `npm test` to run the test suite which is based upon mocha.

## License
Created by Adrian Cooney. Licensed under the MIT License.