// deno-lint-ignore-file no-explicit-any

export type WrappedAsyncIterator<T> = {
  unwrap: () => AsyncIterator<T>;
  map: <U>(mapperFn: (t: T) => U | Promise<U>) => WrappedAsyncIterator<U>;
  filter: {
    <U extends T>(
      filtererFn: (t: T) => t is U,
    ): WrappedAsyncIterator<U>;
    (
      filtererFn: (t: T) => boolean | Promise<boolean>,
    ): WrappedAsyncIterator<T>;
  };
  take: (limit: number) => WrappedAsyncIterator<T>;
  drop: (limit: number) => WrappedAsyncIterator<T>;
  asIndexedPairs: () => WrappedAsyncIterator<[number, T]>;
  flatMap: <U>(
    mapperFn: (
      t: T,
    ) =>
      | U
      | Iterable<U>
      | AsyncIterable<U>
      | Promise<U | Iterable<U> | AsyncIterable<U>>,
  ) => WrappedAsyncIterator<U>;
  reduce: {
    <U>(
      reducerFn: (u: U, t: T) => U | Promise<U>,
      initialValue: U,
    ): Promise<U>;
    <U>(
      reducerFn: (u: U | undefined, t: T) => U | Promise<U>,
    ): Promise<U | undefined>;
  };
  toArray: () => Promise<T[]>;
  forEach: (fn: (t: T) => void | Promise<void>) => Promise<void>;
  some: (fn: (t: T) => boolean | Promise<boolean>) => Promise<boolean>;
  every: (fn: (t: T) => boolean | Promise<boolean>) => Promise<boolean>;
  find: {
    <U extends T>(
      filtererFn: (t: T) => t is U,
    ): Promise<U | undefined>;
    (
      filtererFn: (t: T) => boolean | Promise<boolean>,
    ): Promise<T | undefined>;
  };
};

export const wrapAsyncIterator = <T>(
  ite: AsyncIterator<T>,
): WrappedAsyncIterator<T> => {
  return {
    unwrap: () => ite,
    map: (mapperFn) => {
      if (typeof mapperFn !== "function") {
        throw new TypeError(`${mapperFn} is not a function`);
      }
      return wrapAsyncIterator((async function* () {
        for await (const v of { [Symbol.asyncIterator]: () => ite }) {
          yield await mapperFn(v);
        }
      })());
    },
    filter: (filtererFn: any) => {
      if (typeof filtererFn !== "function") {
        throw new TypeError(`${filtererFn} is not a function`);
      }
      return wrapAsyncIterator((async function* () {
        for await (const v of { [Symbol.asyncIterator]: () => ite }) {
          if (await filtererFn(v)) yield v;
        }
      })());
    },
    take: (limit) => {
      if (typeof limit === "symbol") {
        throw new TypeError("Cannot convert a Symbol value to a number");
      }
      if (typeof limit === "bigint") {
        throw new TypeError("Cannot convert a BigInt value to a number");
      }
      if (limit < 0) throw new RangeError(`Invalid limit value`);
      if (Number.isFinite(limit)) limit = Math.floor(limit);
      if (Number.isNaN(limit)) limit = 0;
      return wrapAsyncIterator((async function* () {
        let remaining = limit;
        for await (const v of { [Symbol.asyncIterator]: () => ite }) {
          if (remaining === 0) break;
          if (remaining !== Infinity) remaining -= 1;
          yield v;
          if (remaining === 0) break;
        }
      })());
    },
    drop: (limit) => {
      if (typeof limit === "symbol") {
        throw new TypeError("Cannot convert a Symbol value to a number");
      }
      if (typeof limit === "bigint") {
        throw new TypeError("Cannot convert a BigInt value to a number");
      }
      if (limit < 0) throw new RangeError(`Invalid limit value`);
      if (Number.isFinite(limit)) limit = Math.floor(limit);
      if (Number.isNaN(limit)) limit = 0;
      return wrapAsyncIterator((async function* () {
        let remaining = limit;
        for await (const v of { [Symbol.asyncIterator]: () => ite }) {
          if (remaining > 0 && remaining !== Infinity) {
            remaining -= 1;
            continue;
          }
          yield v;
        }
      })());
    },
    asIndexedPairs: () => {
      return wrapAsyncIterator((async function* () {
        let i = 0;
        for await (const v of { [Symbol.asyncIterator]: () => ite }) {
          yield [i, v] as [number, T];
          i += 1;
        }
      })());
    },
    flatMap: (mapperFn) => {
      if (typeof mapperFn !== "function") {
        throw new TypeError(`${mapperFn} is not a function`);
      }
      return wrapAsyncIterator((async function* () {
        for await (const v of { [Symbol.asyncIterator]: () => ite }) {
          const inner = await mapperFn(v);
          const getAsync = (inner as any)[Symbol.asyncIterator];
          if (getAsync != null) {
            if (typeof getAsync !== "function") {
              throw new TypeError(`${getAsync} is not a function`);
            }
            const iteInner = getAsync.call(inner);
            for await (const vInner of iteInner) yield vInner;
          } else {
            const getSync = (inner as any)[Symbol.iterator];
            if (getSync != null) {
              if (typeof getSync !== "function") {
                throw new TypeError(`${getSync} is not a function`);
              }
              const iteInner = getSync.call(inner);
              for (const vInner of iteInner) yield vInner;
            } else {
              yield inner;
            }
          }
        }
      })());
    },
    reduce: (async (reducerFn: any, initialValue: any) => {
      if (typeof reducerFn !== "function") {
        throw new TypeError(`${reducerFn} is not a function`);
      }
      let current = initialValue;
      for await (const v of { [Symbol.asyncIterator]: () => ite }) {
        current = await reducerFn(current, v);
      }
      return current;
    }) as any,
    toArray: async () => {
      const arr: T[] = [];
      for await (const v of { [Symbol.asyncIterator]: () => ite }) {
        arr.push(v);
      }
      return arr;
    },
    forEach: async (fn) => {
      if (typeof fn !== "function") {
        throw new TypeError(`${fn} is not a function`);
      }
      for await (const v of { [Symbol.asyncIterator]: () => ite }) {
        await fn(v);
      }
    },
    some: async (fn) => {
      if (typeof fn !== "function") {
        throw new TypeError(`${fn} is not a function`);
      }
      for await (const v of { [Symbol.asyncIterator]: () => ite }) {
        if (await fn(v)) return true;
      }
      return false;
    },
    every: async (fn) => {
      if (typeof fn !== "function") {
        throw new TypeError(`${fn} is not a function`);
      }
      for await (const v of { [Symbol.asyncIterator]: () => ite }) {
        if (!await fn(v)) return false;
      }
      return true;
    },
    find: async (fn: any) => {
      if (typeof fn !== "function") {
        throw new TypeError(`${fn} is not a function`);
      }
      for await (const v of { [Symbol.asyncIterator]: () => ite }) {
        if (await fn(v)) return v;
      }
    },
  };
};
