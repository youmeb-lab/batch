'use strict';

var co = require('co');
var util = require('util');
var Duplex = require('stream').Duplex;
var end = Duplex.prototype.end;
var push = Duplex.prototype.push;

module.exports = Batch;
util.inherits(Batch, Duplex);

var batch = Batch.prototype;

function Batch(options) {
  if (!(this instanceof Batch)) {
    return new Batch(options);
  }

  options || (options = {});
  options.objectMode = true;
  Duplex.call(this, options);
  this.concurrency = options.concurrency || 5;
  this._yield = null;
  this._needResult = false;
  this._done = false;
  this.running = 0;
  this.waiting = [];
  this.results = [];
  this.on('run', this.run.bind(this));
}

Object.defineProperty(batch, 'done', {
  get: function () {
    return !this._done
      || this.results.length;
  }
});

batch._write = function (chunk, enc, cb) {
  if (!chunk) {
    return cb();
  }

  if (!this.run(chunk, cb)) {
    this.waiting.push({
      job: chunk,
      cb: cb
    });
  }
};

batch._read = function () {
  if (this._done) {
    this.push(null);
    return;
  }

  var res = this.results.shift();

  if (res) {
    this.push(res);
  } else {
    this._needResult = true;
  }
};

batch.end = function () {
  this.write.apply(this, arguments);
  end.call(this);
};

batch.run = function (job, cb) {
  if (this.running < this.concurrency) {
    this._run(job)
      .then(this.success.bind(this))
      .catch(this.emit.bind(this, 'error'))
      .then(this.final.bind(this))
    cb();
    return true;
  }
};

batch._run = function (job) {
  this.running += 1;
  return co(function *() {
    return yield job;
  });
};

batch.success = function (res) {
  if (this._needResult) {
    this.push(res);
  } else {
    this.results.push(res);
  }
};

batch.final = function () {
  this.running -= 1;
  
  var state = this._writableState;
  var next = this.waiting.shift();
  
  next && this.run(next.job, next.cb);

  if (state.ended && !next && !this.running) {
    this._done = true;
  }
  
  if (this._yield) {
    this._yield(this.results.shift());
    this._yield = null;
  }
};

batch.next = function () {
  return {
    done: true,
    value: new Promise(function (resolve, reject) {
      var res = this.results.shift();
      
      if (res) {
        return resolve(res);
      }

      this._yield = resolve;
    }.bind(this))
  };
};

batch.throw = function (err) {
  this.emit('error', err);
};
