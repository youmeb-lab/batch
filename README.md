batch
=====

## Example 1

```javascript
co(function *() {
  var batch = new Batch({
    concurrency: 2
  });

  batch.write(yieldable);
  batch.write(yieldable);
  batch.write(yieldable);
  batch.write(yieldable);
  batch.write(yieldable);
  batch.end(yieldable);

  while (!batch.done) {
    let data = yield batch;
    console.log(data);
  }
});
```
