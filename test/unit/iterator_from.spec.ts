// deno-lint-ignore-file no-explicit-any

import { asserts } from "../../deps.ts";
import { iteratorFrom } from "../../lib/iterator_from.ts";
import { wrapIterator } from "../../lib/wrap_iterator.ts";

Deno.test({
  name: "From IteratorLike to Array",
  fn() {
    asserts.assertEquals(
      wrapIterator(iteratorFrom([true, ["2"], 3, 4n])).toArray(),
      [true, ["2"], 3, 4n],
    );
    asserts.assertEquals(
      wrapIterator(iteratorFrom(iteratorFrom([true, ["2"], 3, 4n]))).toArray(),
      [true, ["2"], 3, 4n],
    );
    {
      const queue = [
        { value: true, done: false },
        { value: ["2"], done: false },
        { value: 3, done: false },
        { value: 4n, done: false },
      ];
      asserts.assertEquals(
        wrapIterator(
          iteratorFrom<boolean | string[] | number | bigint>({
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
      () => iteratorFrom({ [Symbol.iterator]: 1 } as any),
      TypeError,
      "not a function",
    );
    asserts.assertThrows(
      () => iteratorFrom({ [Symbol.iterator]: () => 1 } as any),
      TypeError,
      "[@@iterator]",
    );
    asserts.assertThrows(
      () => iteratorFrom(1 as any),
      TypeError,
      "called on non-object",
    );
    asserts.assertThrows(
      () => iteratorFrom({ next: 1 } as any),
      TypeError,
      "not a function",
    );
  },
});
