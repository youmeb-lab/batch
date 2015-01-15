'use strict';

var co = require('co');
var Batch = require('./');
var batch = new Batch();

var counter = (function () {
  var c = 0;
  return function () {
    var i = c++;
    return function (cb) {
      cb(null, i);
    };
  };
})();

batch.write(counter());
batch.write(counter());
batch.write(counter());
batch.write(counter());
batch.write(counter());
batch.write(counter());
batch.write(counter());
batch.write(counter());
batch.write(counter());
batch.write(counter());
batch.write(counter());
batch.end(counter());

co(function *() {
  while (batch.readable) {
    let data = yield batch;
    yield function (cb) {
      setTimeout(cb, 100);
    };
    console.log(data);
  }
})
  .then(function () {
    console.log('done');
  })
  .catch(function (e) {
    console.log(e.stack);
  });
