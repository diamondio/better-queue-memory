# Better Queue - Store Tests

This repository is a complement to [better-queue](https://github.com/diamondio/better-queue). This is useful for ensuring that the store you create is compatible with `better-queue`, and that guarantees that features in `better-queue` will work properly.


### Getting started

Install this package as a dev dependency and add a mocha test:

```bash
npm install --save-dev better-queue-store-test
```

### Usage

In your mocha test directory, add a test like so:

```
var test = require('better-queue-store-test');

test.basic('My Store Test', {

  create: function (cb) {
    // Prepare your store here ...
    cb(null, myStore);
  },

  destroy: function (cb) {
    // Optionally, you can clean up after your store
    cb();
  }

})
```

### Examples

Look at [better-queue-memory](https://github.com/diamondio/better-queue-memory), which is used in `better-queue` for an example of how you should create your store and setup the test.

### Contributions

Are welcome!

This library was initially made by the awesome team of engineers at [Diamond](https://diamond.io).

If you haven't already, make sure you install Diamond!

