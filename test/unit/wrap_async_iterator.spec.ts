// deno-lint-ignore-file no-explicit-any

import { asserts } from "../../deps.ts";
import { wrapAsyncIterator } from "../../lib/wrap_async_iterator.ts";
import { asyncIteratorFrom } from "../../lib/async_iterator_from.ts";

Deno.test({
  name: "AsyncIterator.prototype.map",
  async fn() {
    const naturals = async function* naturals() {
      let i = 0;
      while (true) {
        await Promise.resolve();
        yield i;
        i += 1;
      }
    };
    const naturalsStr: AsyncIterator<string> = wrapAsyncIterator(naturals())
      .map((e) => e.toString())
      .unwrap();
    asserts.assertEquals(
      await wrapAsyncIterator(naturalsStr).take(4).toArray(),
      ["0", "1", "2", "3"],
    );
    asserts.assertThrows(
      () => wrapAsyncIterator(naturals()).map(1 as any),
      TypeError,
    );
  },
});

Deno.test({
  name: "AsyncIterator.prototype.filter",
  async fn() {
    const naturals = async function* naturals() {
      let i = 0;
      while (true) {
        yield i;
        i += 1;
      }
    };
    const isPrime10 = (n: number): n is 2 | 3 | 5 | 7 =>
      n === 2 || n === 3 || n === 5 || n === 7;
    const prime10: AsyncIterator<2 | 3 | 5 | 7> = wrapAsyncIterator(naturals())
      .filter(isPrime10)
      .unwrap();
    asserts.assertEquals(
      await wrapAsyncIterator(prime10).take(4).toArray(),
      [2, 3, 5, 7],
    );
    asserts.assertThrows(
      () => wrapAsyncIterator(naturals()).filter(1 as any),
      TypeError,
    );
  },
});

Deno.test({
  name: "AsyncIterator.prototype.take",
  async fn() {
    const naturals = async function* naturals() {
      let i = 0;
      while (true) {
        yield i;
        i += 1;
      }
    };
    asserts.assertEquals(
      await wrapAsyncIterator(naturals()).take(4).toArray(),
      [0, 1, 2, 3],
    );
    asserts.assertEquals(
      await wrapAsyncIterator(naturals()).take(4).take(NaN).toArray(),
      [],
    );
    asserts.assertEquals(
      await wrapAsyncIterator(naturals()).take(0).toArray(),
      [],
    );
    asserts.assertEquals(
      await wrapAsyncIterator(naturals()).take(-0).toArray(),
      [],
    );
    asserts.assertEquals(
      await wrapAsyncIterator(naturals()).take(Infinity).take(4).take(Infinity)
        .toArray(),
      [0, 1, 2, 3],
    );
    asserts.assertEquals(
      await wrapAsyncIterator(naturals()).take(3.3).toArray(),
      [0, 1, 2],
    );
    asserts.assertEquals(
      await wrapAsyncIterator(naturals()).take("5" as any).toArray(),
      [0, 1, 2, 3, 4],
    );
    asserts.assertThrows(
      () => wrapAsyncIterator(naturals()).take(-1),
      RangeError,
    );
    asserts.assertThrows(
      () => wrapAsyncIterator(naturals()).take(-Infinity),
      RangeError,
    );
    asserts.assertThrows(
      () => wrapAsyncIterator(naturals()).take(Symbol() as any),
      TypeError,
    );
    asserts.assertThrows(
      () => wrapAsyncIterator(naturals()).take(1n as any),
      TypeError,
    );
  },
});

Deno.test({
  name: "AsyncIterator.prototype.drop",
  async fn() {
    {
      const naturals = async function* naturals() {
        let i = 0;
        while (true) {
          yield i;
          i += 1;
        }
      };
      asserts.assertEquals(
        await wrapAsyncIterator(naturals()).drop(4).take(4).toArray(),
        [4, 5, 6, 7],
      );
      asserts.assertEquals(
        await wrapAsyncIterator(naturals()).drop(NaN).take(4).toArray(),
        [0, 1, 2, 3],
      );
      asserts.assertEquals(
        await wrapAsyncIterator(naturals()).drop(0).take(4).toArray(),
        [0, 1, 2, 3],
      );
      asserts.assertEquals(
        await wrapAsyncIterator(naturals()).drop(-0).take(4).toArray(),
        [0, 1, 2, 3],
      );
      asserts.assertEquals(
        await wrapAsyncIterator(naturals()).drop(3.3).take(4).toArray(),
        [3, 4, 5, 6],
      );
      asserts.assertEquals(
        await wrapAsyncIterator(naturals()).drop("5" as any).take(4).toArray(),
        [5, 6, 7, 8],
      );
      asserts.assertThrows(
        () => wrapAsyncIterator(naturals()).drop(-1),
        RangeError,
      );
      asserts.assertThrows(
        () => wrapAsyncIterator(naturals()).drop(-Infinity),
        RangeError,
      );
      asserts.assertThrows(
        () => wrapAsyncIterator(naturals()).drop(Symbol() as any),
        TypeError,
      );
      asserts.assertThrows(
        () => wrapAsyncIterator(naturals()).drop(1n as any),
        TypeError,
      );
    }
    {
      const taken: number[] = [];
      const ite = (async function* naturals() {
        let i = 0;
        while (true) {
          taken.push(i);
          yield i;
          i += 1;
        }
      })();
      const ite2 = wrapAsyncIterator(ite).take(4).drop(Infinity);
      asserts.assertEquals(
        taken,
        [],
      );
      await ite2.toArray();
      asserts.assertEquals(
        taken,
        [0, 1, 2, 3],
      );
    }
  },
});

Deno.test({
  name: "AsyncIterator.prototype.asIndexedPairs",
  async fn() {
    const naturals = async function* naturals() {
      let i = 0;
      while (true) {
        yield i;
        i += 1;
      }
    };
    asserts.assertEquals(
      await wrapAsyncIterator(naturals())
        .filter((e) => e % 2 === 1)
        .asIndexedPairs()
        .take(4).toArray(),
      [[0, 1], [1, 3], [2, 5], [3, 7]],
    );
  },
});

Deno.test({
  name: "AsyncIterator.prototype.flatMap",
  async fn() {
    asserts.assertEquals(
      await wrapAsyncIterator(asyncIteratorFrom([1, 2, [3, 4], [5, [6, 7], 8]]))
        .flatMap<number | number[]>((e) => typeof e === "number" ? e * 100 : e)
        .toArray(),
      [100, 200, 3, 4, 5, [6, 7], 8],
    );
    asserts.assertThrows(
      () => wrapAsyncIterator(asyncIteratorFrom([1, 2, 3])).flatMap(1 as any),
      TypeError,
    );
  },
});

Deno.test({
  name: "AsyncIterator.prototype.reduce",
  async fn() {
    {
      const got: { sum: number; cnt: number } = await wrapAsyncIterator(
        asyncIteratorFrom([1, 2, 3]),
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
      const got: number | undefined = await wrapAsyncIterator(
        asyncIteratorFrom([1, 2, 3]),
      )
        .reduce((x, y) => x || y);
      asserts.assertEquals(
        got,
        1,
      );
    }
    asserts.assertRejects(
      () => wrapAsyncIterator(asyncIteratorFrom([1, 2, 3])).reduce(1 as any),
      TypeError,
    );
  },
});

Deno.test({
  name: "AsyncIterator.prototype.forEach",
  async fn() {
    const arr: number[] = [];
    await wrapAsyncIterator(
      asyncIteratorFrom([1, 2, 3, 4]),
    )
      .forEach((e) => void arr.push(e));
    asserts.assertEquals(
      arr,
      [1, 2, 3, 4],
    );
    asserts.assertRejects(
      () => wrapAsyncIterator(asyncIteratorFrom([1, 2, 3])).forEach(1 as any),
      TypeError,
    );
  },
});

Deno.test({
  name: "AsyncIterator.prototype.some",
  async fn() {
    {
      const taken: number[] = [];
      const ite = (async function* naturals() {
        let i = 0;
        while (true) {
          taken.push(i);
          yield i;
          i += 1;
        }
      })();
      const got: boolean = await wrapAsyncIterator(
        ite,
      )
        .take(10)
        .some((e) => e > 4);
      asserts.assert(got);
      asserts.assertEquals(
        taken,
        [0, 1, 2, 3, 4, 5],
      );
      asserts.assertRejects(
        () => wrapAsyncIterator(asyncIteratorFrom([1, 2, 3])).some(1 as any),
        TypeError,
      );
    }
    {
      asserts.assert(
        !await wrapAsyncIterator(
          asyncIteratorFrom([1, 3, 5, 7]),
        ).some((e) => e % 2 === 0),
      );
    }
  },
});

Deno.test({
  name: "AsyncIterator.prototype.every",
  async fn() {
    {
      const taken: number[] = [];
      const ite = (async function* naturals() {
        let i = 0;
        while (true) {
          taken.push(i);
          yield i;
          i += 1;
        }
      })();
      const got: boolean = await wrapAsyncIterator(
        ite,
      )
        .take(10)
        .every((e) => e > 4);
      asserts.assert(!got);
      asserts.assertEquals(
        taken,
        [0],
      );
      asserts.assertRejects(
        () => wrapAsyncIterator(asyncIteratorFrom([1, 2, 3])).every(1 as any),
        TypeError,
      );
    }
    {
      asserts.assert(
        await wrapAsyncIterator(
          asyncIteratorFrom([1, 3, 5, 7]),
        ).every((e) => e % 2 === 1),
      );
    }
  },
});

Deno.test({
  name: "AsyncIterator.prototype.find",
  async fn() {
    {
      const taken: number[] = [];
      const ite = (async function* naturals() {
        let i = 0;
        while (true) {
          taken.push(i);
          yield i;
          i += 1;
        }
      })();
      const got: number | undefined = await wrapAsyncIterator(
        ite,
      )
        .take(10)
        .find((e) => e > 4);
      asserts.assertEquals(got, 5);
      asserts.assertEquals(
        taken,
        [0, 1, 2, 3, 4, 5],
      );
      asserts.assertRejects(
        () => wrapAsyncIterator(asyncIteratorFrom([1, 2, 3])).find(1 as any),
        TypeError,
      );
    }
    {
      asserts.assertEquals(
        await wrapAsyncIterator(
          asyncIteratorFrom([1, 3, 5, 7]),
        ).find((e) => e % 2 === 0),
        undefined,
      );
    }
  },
});
