batch
=====

```javascript
co(function *() {
  var batch = new Batch({
    concurrency: 2
  });

  batch.on('data', function (data) {
    console.log(data);
  });

  batch.write(yieldable);
  batch.write(yieldable);
  batch.write(yieldable);
  batch.write(yieldable);
  batch.write(yieldable);
  batch.end(yieldable);

  yield batch.done();
});
```
