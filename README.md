# Auto Promise

A module for getting [caolan-style](https://caolan.github.io/async/v3/docs.html#auto) "async.auto" type functionality but for Promise-style async functions.

Not yet necessarily stable (still need to add support for concurrency limit), but seems to work so far. Had fun writing it as a meditative challenge, may tighten it up recreationally.

Basically the same design goal as `promise-auto`, `auto-promise`, or `promise-auto2`, except using native language Promises, so it's a bit more modern in style. Also written in TypeScript. Honestly we all probably did it because writing this module is fun.

## Usage

This module is maintained in the style of the MetaMask team.

It uses:
- Typescript
- Rollup

## Installation

`auto-promise2` is made available as either a CommonJS module, and ES6 module, or an ES5 bundle.

* ES6 module: `import auto from 'auto-promise2'`
* ES5 module: `const auto = require('auto-promise2')`
* ES5 bundle: `dist/auto-promise2.js` (this can be included directly in a page)

## Usage
You pass `auto()` an object where keys are different tasks, and each task is an array where the last item is an async function to perform, and any preceding entries are string names of other tasks that must be completed first.

Each task is then passed a `needs` object that includes keyed results for all previously completed tasks, and the entire `auto()` function returns a promise for an object with all the completed values keyed on their task names.

Makes it easy to write complex weaving conditional logic for many tasks to run concurrently.

```javascript
const result = await auto({
    a: [async () => 'a'],
    b: [async () => 'b'],
    c: ['a', async (needs) => needs.a ? 'c' : 'no'],
    d: ['a', 'b', async (needs) => needs.a && needs.b ? 'd' : 'no'],
    e: ['c', 'd', async (needs) => needs.c && needs.d ? 'e' : 'no'],
});
expect(result.e).toEqual('e');
```
## Testing

Run `yarn test` to run the tests once.

To run tests on file changes, run `yarn test:watch`.

## Release & Publishing

1. Create a release branch
    - For a typical release, this would be based on `main`
    - To update an older maintained major version, base the release branch on the major version branch (e.g. `1.x`)
2. Update the changelog
3. Update version in package.json file (e.g. `yarn version --minor --no-git-tag-version`)
4. Create a pull request targeting the base branch (e.g. main or 1.x)
5. Code review and QA
6. Once approved, the PR is squashed & merged
7. The commit on the base branch is tagged
8. The tag can be published as needed
