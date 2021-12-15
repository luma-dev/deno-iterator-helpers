// deno-lint-ignore-file no-explicit-any

import { asserts } from "../../deps.ts";
import { iteratorFrom } from "../../lib/iterator_from.ts";
import { wrapIterator } from "../../lib/wrap_iterator.ts";

const naturals = function* naturals() {
  let i = 0;
  while (true) {
    yield i;
    i += 1;
  }
};

type Prime10 = 2 | 3 | 5 | 7;
const isPrime10 = (n: number): n is Prime10 =>
  n === 2 || n === 3 || n === 5 || n === 7;

Deno.test({
  name: "Iterator.prototype.map",
  fn() {
    const naturalsStr: Iterator<string> = wrapIterator(naturals())
      .map((e) => e.toString())
      .unwrap();
    asserts.assertEquals(
      wrapIterator(naturalsStr).take(4).toArray(),
      ["0", "1", "2", "3"],
    );
    asserts.assertThrows(
      () => wrapIterator(naturals()).map(1 as any),
      TypeError,
    );
  },
});

Deno.test({
  name: "Iterator.prototype.filter",
  fn() {
    const prime10: Iterator<Prime10> = wrapIterator(naturals())
      .filter(isPrime10)
      .unwrap();
    asserts.assertEquals(
      wrapIterator(prime10).take(4).toArray(),
      [2, 3, 5, 7],
    );
    asserts.assertThrows(
      () => wrapIterator(naturals()).filter(1 as any),
      TypeError,
    );
  },
});

Deno.test({
  name: "Iterator.prototype.take",
  fn() {
    asserts.assertEquals(
      wrapIterator(naturals()).take(4).toArray(),
      [0, 1, 2, 3],
    );
    asserts.assertEquals(
      wrapIterator(naturals()).take(4).take(NaN).toArray(),
      [],
    );
    asserts.assertEquals(
      wrapIterator(naturals()).take(0).toArray(),
      [],
    );
    asserts.assertEquals(
      wrapIterator(naturals()).take(-0).toArray(),
      [],
    );
    asserts.assertEquals(
      wrapIterator(naturals()).take(Infinity).take(4).take(Infinity).toArray(),
      [0, 1, 2, 3],
    );
    asserts.assertEquals(
      wrapIterator(naturals()).take(3.3).toArray(),
      [0, 1, 2],
    );
    asserts.assertEquals(
      wrapIterator(naturals()).take("5" as any).toArray(),
      [0, 1, 2, 3, 4],
    );
    asserts.assertThrows(
      () => wrapIterator(naturals()).take(-1),
      RangeError,
    );
    asserts.assertThrows(
      () => wrapIterator(naturals()).take(-Infinity),
      RangeError,
    );
    asserts.assertThrows(
      () => wrapIterator(naturals()).take(Symbol() as any),
      TypeError,
    );
    asserts.assertThrows(
      () => wrapIterator(naturals()).take(1n as any),
      TypeError,
    );
  },
});

Deno.test({
  name: "Iterator.prototype.drop",
  fn() {
    {
      asserts.assertEquals(
        wrapIterator(naturals()).drop(4).take(4).toArray(),
        [4, 5, 6, 7],
      );
      asserts.assertEquals(
        wrapIterator(naturals()).drop(NaN).take(4).toArray(),
        [0, 1, 2, 3],
      );
      asserts.assertEquals(
        wrapIterator(naturals()).drop(0).take(4).toArray(),
        [0, 1, 2, 3],
      );
      asserts.assertEquals(
        wrapIterator(naturals()).drop(-0).take(4).toArray(),
        [0, 1, 2, 3],
      );
      asserts.assertEquals(
        wrapIterator(naturals()).drop(3.3).take(4).toArray(),
        [3, 4, 5, 6],
      );
      asserts.assertEquals(
        wrapIterator(naturals()).drop("5" as any).take(4).toArray(),
        [5, 6, 7, 8],
      );
      asserts.assertThrows(
        () => wrapIterator(naturals()).drop(-1),
        RangeError,
      );
      asserts.assertThrows(
        () => wrapIterator(naturals()).drop(-Infinity),
        RangeError,
      );
      asserts.assertThrows(
        () => wrapIterator(naturals()).drop(Symbol() as any),
        TypeError,
      );
      asserts.assertThrows(
        () => wrapIterator(naturals()).drop(1n as any),
        TypeError,
      );
    }
    {
      const taken: number[] = [];
      const ite = (function* naturals() {
        let i = 0;
        while (true) {
          taken.push(i);
          yield i;
          i += 1;
        }
      })();
      const ite2 = wrapIterator(ite).take(4).drop(Infinity);
      asserts.assertEquals(
        taken,
        [],
      );
      ite2.toArray();
      asserts.assertEquals(
        taken,
        [0, 1, 2, 3],
      );
    }
  },
});

Deno.test({
  name: "Iterator.prototype.asIndexedPairs",
  fn() {
    asserts.assertEquals(
      wrapIterator(naturals())
        .filter((e) => e % 2 === 1)
        .asIndexedPairs()
        .take(4).toArray(),
      [[0, 1], [1, 3], [2, 5], [3, 7]],
    );
  },
});

Deno.test({
  name: "Iterator.prototype.flatMap",
  fn() {
    asserts.assertEquals(
      wrapIterator(iteratorFrom([
        1,
        2,
        [3, 4],
        [5, [6, 7], 8],
        // any iterable should be accepted
        Uint8Array.from([9, 10, 11]),
      ]))
        .flatMap<number | number[]>((e) => typeof e === "number" ? e * 100 : e)
        .toArray(),
      [100, 200, 3, 4, 5, [6, 7], 8, 9, 10, 11],
    );
    asserts.assertEquals(
      wrapIterator(iteratorFrom([
        1,
      ]))
        .flatMap<number | number[]>(function* (e) {
          yield e * 10;
          yield e * 20;
        })
        .toArray(),
      [10, 20],
    );
    asserts.assertThrows(
      () =>
        wrapIterator(iteratorFrom([0])).flatMap(() => ({
          [Symbol.iterator]: 0,
        })).toArray(),
      TypeError,
    );
    asserts.assertThrows(
      () => wrapIterator(iteratorFrom([1, 2, 3])).flatMap(1 as any),
      TypeError,
    );
  },
});

Deno.test({
  name: "Iterator.prototype.reduce",
  fn() {
    {
      const got: { sum: number; cnt: number } = wrapIterator(
        iteratorFrom([1, 2, 3]),
      )
        .reduce(({ sum, cnt }, x) => ({ sum: sum + x, cnt: cnt + 1 }), {
          sum: 0,
          cnt: 0,
        });
      asserts.assertEquals(
        got,
        { sum: 6, cnt: 3 },
      );
    }
    {
      const got: number | undefined = wrapIterator(
        iteratorFrom([1, 2, 3]),
      )
        .reduce((x, y) => x || y);
      asserts.assertEquals(
        got,
        1,
      );
    }
    asserts.assertThrows(
      () => wrapIterator(iteratorFrom([1, 2, 3])).reduce(1 as any),
      TypeError,
    );
  },
});

Deno.test({
  name: "Iterator.prototype.forEach",
  fn() {
    const arr: number[] = [];
    wrapIterator(
      iteratorFrom([1, 2, 3, 4]),
    )
      .forEach((e) => arr.push(e));
    asserts.assertEquals(
      arr,
      [1, 2, 3, 4],
    );
    asserts.assertThrows(
      () => wrapIterator(iteratorFrom([1, 2, 3])).forEach(1 as any),
      TypeError,
    );
  },
});

Deno.test({
  name: "Iterator.prototype.some",
  fn() {
    {
      const taken: number[] = [];
      const ite = (function* naturals() {
        let i = 0;
        while (true) {
          taken.push(i);
          yield i;
          i += 1;
        }
      })();
      const got: boolean = wrapIterator(
        ite,
      )
        .take(10)
        .some((e) => e > 4);
      asserts.assert(got);
      asserts.assertEquals(
        taken,
        [0, 1, 2, 3, 4, 5],
      );
      asserts.assertThrows(
        () => wrapIterator(iteratorFrom([1, 2, 3])).some(1 as any),
        TypeError,
      );
    }
    {
      asserts.assert(
        !wrapIterator(
          iteratorFrom([1, 3, 5, 7]),
        ).some((e) => e % 2 === 0),
      );
    }
  },
});

Deno.test({
  name: "Iterator.prototype.every",
  fn() {
    {
      const taken: number[] = [];
      const ite = (function* naturals() {
        let i = 0;
        while (true) {
          taken.push(i);
          yield i;
          i += 1;
        }
      })();
      const got: boolean = wrapIterator(
        ite,
      )
        .take(10)
        .every((e) => e > 4);
      asserts.assert(!got);
      asserts.assertEquals(
        taken,
        [0],
      );
      asserts.assertThrows(
        () => wrapIterator(iteratorFrom([1, 2, 3])).every(1 as any),
        TypeError,
      );
    }
    {
      asserts.assert(
        wrapIterator(
          iteratorFrom([1, 3, 5, 7]),
        ).every((e) => e % 2 === 1),
      );
    }
  },
});

Deno.test({
  name: "Iterator.prototype.find",
  fn() {
    {
      const taken: number[] = [];
      const ite = (function* naturals() {
        let i = 0;
        while (true) {
          taken.push(i);
          yield i;
          i += 1;
        }
      })();
      const got: number | undefined = wrapIterator(
        ite,
      )
        .take(10)
        .find((e) => e > 4);
      asserts.assertEquals(got, 5);
      asserts.assertEquals(
        taken,
        [0, 1, 2, 3, 4, 5],
      );
      asserts.assertThrows(
        () => wrapIterator(iteratorFrom([1, 2, 3])).find(1 as any),
        TypeError,
      );
    }
    {
      const got: Prime10 | undefined = wrapIterator(naturals())
        .take(10)
        .find(isPrime10);
      asserts.assertEquals(got, 2);
    }
    {
      asserts.assertEquals(
        wrapIterator(
          iteratorFrom([1, 3, 5, 7]),
        ).find((e) => e % 2 === 0),
        undefined,
      );
    }
  },
});
