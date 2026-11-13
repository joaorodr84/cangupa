import { createWriteQueue } from './writeQueue';

// A deferred promise per write, so a test controls exactly when each one
// resolves — the only way to actually exercise "started out of order,
// landed in order" rather than just "ran one after another because nothing
// was concurrent to begin with".
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

// Flushes real microtasks (a `Promise.resolve()` chain doesn't flush a
// `.then().catch()` built on an already-settled promise in a single tick —
// a real macrotask boundary does).
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

test('runs a single write', async () => {
  const enqueue = createWriteQueue();
  const write = jest.fn().mockResolvedValue(undefined);

  enqueue(write);
  await flush();

  expect(write).toHaveBeenCalledTimes(1);
});

test('does not start the next write until the previous one has settled, even if the second would resolve first', async () => {
  const order: string[] = [];
  const enqueue = createWriteQueue();
  const first = deferred<void>();
  const second = deferred<void>();

  enqueue(() => {
    order.push('first started');
    return first.promise;
  });
  enqueue(() => {
    order.push('second started');
    return second.promise;
  });

  // Let any already-startable work happen. Only the first write should have
  // started — the second is still queued behind it.
  await flush();
  expect(order).toEqual(['first started']);

  // Resolve the SECOND write's underlying work first — if the queue started
  // both concurrently, this would be a no-op with nothing listening yet.
  second.resolve();
  await flush();
  expect(order).toEqual(['first started']);

  // Only once the first write settles does the second one get to start.
  first.resolve();
  await flush();
  expect(order).toEqual(['first started', 'second started']);
});

test("a failed write doesn't block the one queued after it", async () => {
  const enqueue = createWriteQueue();
  const onError = jest.fn().mockRejectedValue(new Error('disk full'));
  const onSuccess = jest.fn().mockResolvedValue(undefined);

  enqueue(onError);
  enqueue(onSuccess);

  await flush();

  expect(onSuccess).toHaveBeenCalledTimes(1);
});

test('three writes to the same queue land in call order', async () => {
  const landed: number[] = [];
  const enqueue = createWriteQueue();

  // The one queued LAST resolves FASTEST — if the queue didn't serialize
  // these, it would land first instead.
  enqueue(() => new Promise((resolve) => setTimeout(() => resolve(landed.push(1)), 30)));
  enqueue(() => new Promise((resolve) => setTimeout(() => resolve(landed.push(2)), 20)));
  enqueue(() => new Promise((resolve) => setTimeout(() => resolve(landed.push(3)), 0)));

  await new Promise((resolve) => setTimeout(resolve, 100));

  expect(landed).toEqual([1, 2, 3]);
});
