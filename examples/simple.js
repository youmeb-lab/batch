'use strict';

var co = require('co');
var Batch = require('./');
var batch = new Batch();

var counter = (function () {
  var c = 0;
  return function () {
    var i = c++;
    return function (cb) {
      console.log(' - ' +  i);
      setTimeout(function () {
        cb(null, i);
      }, 200)
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
batch.end();

co(function *() {
  while (!batch.done) {
    let data = yield batch;
    console.log(data);
  }
})
  .then(function () {
    console.log('done');
  })
  .catch(function (e) {
    console.log(e.stack);
  });
