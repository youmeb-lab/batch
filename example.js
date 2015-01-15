'use strict';

var co = require('co');
var Batch = require('./');
var batch = new Batch();

var counter = (function () {
  var c = 0;
  return function () {
    var i = c++;
    return function *() {
      console.log(i);
      return i;
    };
  };
})();

batch.on('data', function (i) {
  console.log(' - ' + i);
});

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
  yield batch.done();
}).catch(function (e) {
  console.log(e.stack);
}).then(function () {
  console.log(123);
});
