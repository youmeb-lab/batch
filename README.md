batch
=====

```javascript
co(function *() {
  var jobs = [];
  var batch = new Batch({
    concurrency: 2
  });

  batch.on('data', function (data) {
    jobs.push(co(function *() {
      // do something
    }));
  });

  batch.write(yieldable);
  batch.write(yieldable);
  batch.write(yieldable);
  batch.write(yieldable);
  batch.write(yieldable);
  batch.end(yieldable);

  yield batch.done();
  yield jobs;
});
```
