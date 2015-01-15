'use strict';

var co = require('co');
var util = require('util');
var Transform = require('stream').Transform;
var end = Transform.prototype.end;
var push = Transform.prototype.push;
var write = Transform.prototype.write;

module.exports = Batch;
util.inherits(Batch, Transform);

var batch = Batch.prototype;

function Batch(options) {
  options || (options = {});
  options.objectMode = true;
  Transform.call(this, options);
  this.concurrency = options.concurrency || 5;
  this.running = 0;
  this.jobs = [];
  this.results = [];
  this.done = false;
  this._done = null;
  this.on('run', this.run.bind(this));
}

Object.defineProperty(batch, 'readable', {
  get: function () {
    return !this.done || this.results.length;
  }
});

batch._transform = function (chunk, enc, cb) {
  if (chunk) {
    this.jobs.push(chunk);
    this.run();
  }
  cb();
};

batch.write = function (chunk, enc, cb) {
  if (this._done) {
    throw new Error('write after end');
  } else {
    write.call(this, chunk, enc, cb);
  }
  return this;
};

batch.end = function (chunk, enc, cb) {
  if (util.isFunction(chunk)
    && chunk.constructor.name !== 'GeneratorFunction') {
    cb = chunk;
    chunk = null;
    enc = null;
  } else if (util.isFunction(enc)) {
    cb = enc;
    encoding = null;
  }

  if (!util.isNullOrUndefined(chunk)) {
    this.write(chunk, enc);
  }

  this._done = end.bind(this);

  return this;
};

batch.run = function () {
  if (this.running < this.concurrency) {
    var job = this.jobs.shift();
    
    if (!job) {
      return;
    }

    this._run(job)
      .then(this.push.bind(this))
      .catch(this.emit.bind(this, 'error'))
      .then(this.final.bind(this));
  }
};

batch._run = function (job) {
  this.running += 1;
  return co(function *() {
    return yield job;
  });
};

batch.final = function () {
  this.running -= 1;

  if (this._done && !this.running && !this.jobs.length) {
    this.done = true;
    this._done();
  } else {
    this.run();
  }
};

batch.push = function (data) {
  this.results.push(data);
  push.call(this, data);
  return this;
};

batch.next = function () {
  return {
    done: true,
    value: new Promise(function (resolve, reject) {
      var res = this.results.shift();
      
      if (res) {
        return resolve(res);
      }

      this.once('data', function () {
        resolve(this.results.shift());
      }.bind(this));
    }.bind(this))
  };
};

batch.throw = function (err) {
  this.emit('error', err);
};

batch.done = function () {
  return (function (cb) {
    this.once('error', cb);
    this.once('end', cb);
  }).bind(this);
};
