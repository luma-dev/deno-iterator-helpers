# deno-iterator-helpers

[![Codecov](https://img.shields.io/codecov/c/github/luma-dev/deno-iterator-helpers?style=flat-square)](https://app.codecov.io/gh/luma-dev/deno-iterator-helpers)

Strict and wrapper version implementation for
https://github.com/tc39/proposal-iterator-helpers.

## Usage

```ts
import {
  asyncIteratorFrom as fromA,
  iteratorFrom as from,
  wrapAsyncIterator as wrapA,
  wrapIterator as wrap,
} from "https://deno.land/x/iterator_helpers/mod.ts";

function* naturals() {
  let i = 0;
  while (true) {
    yield i;
    i += 1;
  }
}

const arr1 = wrap(naturals())
  .filter((n) => n % 2 === 1) // filter odd numbers
  .map((n) => n ** 2) // square numbers
  .flatMap((n) => [n, n]) // twice each numbers
  .take(10) // cut up to 10 items
  .toArray(); // evaluate and collect items into array
console.log(arr1); // [1, 1, 9, 9, 25, 25, 49, 49, 81, 81]

const arr2 = await wrapA(fromA(naturals()))
  .filter(async (n) => {
    const res = await fetch(`https://api.isevenapi.xyz/api/iseven/${n}/`);
    if (!res.body) throw new Error("No body");
    const raw = Uint8Array.from(
      await wrapA(fromA(res.body))
        .flatMap((e) => e)
        .toArray(),
    );
    const obj = JSON.parse(new TextDecoder().decode(raw));
    return obj.iseven;
  }) // filter even numbers
  .map((n) => n ** 2) // square numbers
  .flatMap((n) => [n, n]) // twice each numbers
  .take(10) // cut up to 10 items
  .toArray(); // evaluate and collect items into array
console.log(arr2); // [0, 0, 4, 4, 16, 16, 36, 36, 64, 64]
```

## Goals

- Implement all proposed features with wrapper API.

## Non-goals

- To make comprehensive library.
  - Just include defined features in the proposal.
- To extend global prototype.
  - Provide APIs via wrapper and method chaining.

## Iteration

- Until proposal becomes stage4, keeping it v0.x and up to date with bumping
  minor if there is breaking change.
- When interfaces are determined, bump major.
- When implemented natively, keep maintaining for months.
- After it passes some months, archive this project.

## Links

- https://github.com/tc39/proposal-iterator-helpers
- https://tc39.es/proposal-iterator-helpers
