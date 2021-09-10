// deno-lint-ignore-file no-explicit-any

export type AsyncIteratorLike<T> =
  | AsyncIterator<T>
  | Iterator<T>
  | AsyncIterable<T>
  | Iterable<T>;
export const asyncIteratorFrom = <T>(
  obj: AsyncIteratorLike<T>,
): AsyncIterator<T> => {
  const getAsyncIte = (obj as any)[Symbol.asyncIterator];
  if (getAsyncIte != null) {
    if (typeof getAsyncIte !== "function") {
      throw new TypeError(`${getAsyncIte} is not a function`);
    }
    const ite: AsyncIterator<T> = getAsyncIte.call(obj);
    if (typeof ite !== "object" && typeof ite !== "function") {
      throw new TypeError(`[@@asyncIterator]() is non-object`);
    }
    return ite;
  }
  const getSyncIte = (obj as any)[Symbol.iterator];
  if (getSyncIte != null) {
    if (typeof getSyncIte !== "function") {
      throw new TypeError(`${getSyncIte} is not a function`);
    }
    const ite: Iterator<T> = getSyncIte.call(obj);
    if (typeof ite !== "object" && typeof ite !== "function") {
      throw new TypeError(`[@@iterator]() is non-object`);
    }
    return (async function* () {
      for (const v of { [Symbol.iterator]: () => ite }) yield v;
    })();
  }
  if (typeof obj !== "object" && typeof obj !== "function") {
    throw new TypeError(`asyncIteratorFrom called on non-object`);
  }
  const { next } = obj as any;
  if (typeof next !== "function") {
    throw new TypeError(`Property next is not a function`);
  }
  // Proposal needs to return AsyncIterator instance, but currently there is no such a real prototype.
  return obj as any;
};
