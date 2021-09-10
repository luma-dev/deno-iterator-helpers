// deno-lint-ignore-file no-explicit-any

import { asserts } from "../../deps.ts";
import { wrapAsyncIterator } from "../../lib/wrap_async_iterator.ts";
import { asyncIteratorFrom } from "../../lib/async_iterator_from.ts";
import { iteratorFrom } from "../../lib/iterator_from.ts";

Deno.test({
  name: "From AsyncIteratorLike to Array",
  async fn() {
    asserts.assertEquals(
      await wrapAsyncIterator(asyncIteratorFrom([true, ["2"], 3, 4n]))
        .toArray(),
      [true, ["2"], 3, 4n],
    );
    asserts.assertEquals(
      await wrapAsyncIterator(
        asyncIteratorFrom(iteratorFrom([true, ["2"], 3, 4n])),
      )
        .toArray(),
      [true, ["2"], 3, 4n],
    );
    asserts.assertEquals(
      await wrapAsyncIterator(
        asyncIteratorFrom(asyncIteratorFrom([true, ["2"], 3, 4n])),
      )
        .toArray(),
      [true, ["2"], 3, 4n],
    );
    {
      const queue = [
        Promise.resolve({ value: true, done: false }),
        Promise.resolve({ value: ["2"], done: false }),
        Promise.resolve({ value: 3, done: false }),
        Promise.resolve({ value: 4n, done: false }),
      ];
      asserts.assertEquals(
        await wrapAsyncIterator(
          asyncIteratorFrom<boolean | string[] | number | bigint>({
            next() {
              return queue.splice(0, 1)[0] ?? { done: true, value: undefined };
            },
          }),
        )
          .toArray(),
        [true, ["2"], 3, 4n],
      );
    }
    asserts.assertThrows(
      () => asyncIteratorFrom({ [Symbol.asyncIterator]: 1 } as any),
      TypeError,
      "not a function",
    );
    asserts.assertThrows(
      () => asyncIteratorFrom({ [Symbol.asyncIterator]: () => 1 } as any),
      TypeError,
      "[@@asyncIterator]",
    );
    asserts.assertThrows(
      () => asyncIteratorFrom({ [Symbol.iterator]: 1 } as any),
      TypeError,
      "not a function",
    );
    asserts.assertThrows(
      () => asyncIteratorFrom({ [Symbol.iterator]: () => 1 } as any),
      TypeError,
      "[@@iterator]",
    );
    asserts.assertThrows(
      () => asyncIteratorFrom(1 as any),
      TypeError,
      "called on non-object",
    );
    asserts.assertThrows(
      () => asyncIteratorFrom({ next: 1 } as any),
      TypeError,
      "not a function",
    );
  },
});
