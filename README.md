# deno-iterator-helpers

Strict and wrapper version implementation for
https://github.com/tc39/proposal-iterator-helpers.

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
