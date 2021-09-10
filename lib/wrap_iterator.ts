// deno-lint-ignore-file no-explicit-any

export type WrappedIterator<T> = {
  unwrap: () => Iterator<T>;
  map: <U>(mapperFn: (t: T) => U) => WrappedIterator<U>;
  filter: {
    <U extends T>(
      filtererFn: (t: T) => t is U,
    ): WrappedIterator<U>;
    (
      filtererFn: (t: T) => boolean,
    ): WrappedIterator<T>;
  };
  take: (limit: number) => WrappedIterator<T>;
  drop: (limit: number) => WrappedIterator<T>;
  asIndexedPairs: () => WrappedIterator<[number, T]>;
  flatMap: <U>(
    mapperFn: (t: T) => U | U[],
  ) => WrappedIterator<U>;
  reduce: {
    <U>(
      reducerFn: (u: U, t: T) => U,
      initialValue: U,
    ): U;
    <U>(
      reducerFn: (u: U | undefined, t: T) => U,
    ): U | undefined;
  };
  toArray: () => T[];
  forEach: (fn: (t: T) => void) => void;
  some: (fn: (t: T) => boolean) => boolean;
  every: (fn: (t: T) => boolean) => boolean;
  find: (fn: (t: T) => boolean) => T | undefined;
};

export const wrapIterator = <T>(ite: Iterator<T>): WrappedIterator<T> => {
  return {
    unwrap: () => ite,
    map: (mapperFn) => {
      if (typeof mapperFn !== "function") {
        throw new TypeError(`${mapperFn} is not a function`);
      }
      return wrapIterator((function* () {
        for (const v of { [Symbol.iterator]: () => ite }) {
          yield mapperFn(v);
        }
      })());
    },
    filter: (filtererFn: any) => {
      if (typeof filtererFn !== "function") {
        throw new TypeError(`${filtererFn} is not a function`);
      }
      return wrapIterator((function* () {
        for (const v of { [Symbol.iterator]: () => ite }) {
          if (filtererFn(v)) yield v;
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
      return wrapIterator((function* () {
        let remaining = limit;
        for (const v of { [Symbol.iterator]: () => ite }) {
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
      return wrapIterator((function* () {
        let remaining = limit;
        for (const v of { [Symbol.iterator]: () => ite }) {
          if (remaining > 0 || remaining === Infinity) {
            if (remaining !== Infinity) remaining -= 1;
            continue;
          }
          yield v;
        }
      })());
    },
    asIndexedPairs: () => {
      return wrapIterator((function* () {
        let i = 0;
        for (const v of { [Symbol.iterator]: () => ite }) {
          yield [i, v] as [number, T];
          i += 1;
        }
      })());
    },
    flatMap: (mapperFn) => {
      if (typeof mapperFn !== "function") {
        throw new TypeError(`${mapperFn} is not a function`);
      }
      return wrapIterator((function* () {
        for (const v of { [Symbol.iterator]: () => ite }) {
          const arr = mapperFn(v);
          if (Array.isArray(arr)) {
            for (const e of arr) yield e;
          } else {
            yield arr;
          }
        }
      })());
    },
    reduce: ((reducerFn: any, initialValue: any) => {
      if (typeof reducerFn !== "function") {
        throw new TypeError(`${reducerFn} is not a function`);
      }
      let current = initialValue;
      for (const v of { [Symbol.iterator]: () => ite }) {
        current = reducerFn(current, v);
      }
      return current;
    }) as any,
    toArray: () => {
      const arr: T[] = [];
      for (const v of { [Symbol.iterator]: () => ite }) {
        arr.push(v);
      }
      return arr;
    },
    forEach: (fn) => {
      if (typeof fn !== "function") {
        throw new TypeError(`${fn} is not a function`);
      }
      for (const v of { [Symbol.iterator]: () => ite }) {
        fn(v);
      }
    },
    some: (fn) => {
      if (typeof fn !== "function") {
        throw new TypeError(`${fn} is not a function`);
      }
      for (const v of { [Symbol.iterator]: () => ite }) {
        if (fn(v)) return true;
      }
      return false;
    },
    every: (fn) => {
      if (typeof fn !== "function") {
        throw new TypeError(`${fn} is not a function`);
      }
      for (const v of { [Symbol.iterator]: () => ite }) {
        if (!fn(v)) return false;
      }
      return true;
    },
    find: (fn) => {
      if (typeof fn !== "function") {
        throw new TypeError(`${fn} is not a function`);
      }
      for (const v of { [Symbol.iterator]: () => ite }) {
        if (fn(v)) return v;
      }
    },
  };
};
