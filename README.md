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

  while (yield batch.readable) {
    let data = yield batch;
    console.log(data);
  }
});
```

## Example 2

```javascript
co(function *() {
  var batch = new Batch();

  // batch.write(...);

  var batch2 = new Batch();

  while (yield batch.readable) {
    let data = yield batch;

    batch2.push(function *() {
      // ...
    }.call(this, data));
  }

  while (!batch2.done) {
    yield batch2;
  }
});
```
