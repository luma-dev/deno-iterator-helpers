// deno-lint-ignore-file no-explicit-any

export type IteratorLike<T> = Iterator<T> | Iterable<T>;
export const iteratorFrom = <T>(obj: IteratorLike<T>): Iterator<T> => {
  const getSyncIte = (obj as any)[Symbol.iterator];
  if (getSyncIte != null) {
    if (typeof getSyncIte !== "function") {
      throw new TypeError(`${getSyncIte} is not a function`);
    }
    const ite: Iterator<T> = getSyncIte.call(obj);
    if (typeof ite !== "object" && typeof ite !== "function") {
      throw new TypeError(`[@@iterator]() is non-object`);
    }
    return (function* () {
      for (const v of { [Symbol.iterator]: () => ite }) yield v;
    })();
  }
  if (typeof obj !== "object" && typeof obj !== "function") {
    throw new TypeError(`iteratorFrom called on non-object`);
  }
  const { next } = obj as any;
  if (typeof next !== "function") {
    throw new TypeError(`Property next is not a function`);
  }
  // Proposal needs to return Iterator instance, but currently there is no such a real prototype.
  return obj as any;
};
