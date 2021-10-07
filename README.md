# Errawr!

Errawr is indubitably the cutest library to help you get help from your errors. It prints semi-structured messages, which is to say that its output is meant to be somewhere in between natural language and JSON. This is particularly freeing because constructing error messages that always read like natural language is a) hard, and b) pointless. A semi-structured approach also makes errors far easier to write and read errors occur due to issues which are difficult to print, like empty strings where non-empty strings are expected, and even errors which arise from unprintable characters.

The project is inspired by the `error.cause` feature of the Ecmascript spec as well as a few existing packages, namely [verror](https://www.npmjs.com/package/verror), [nerror](https://www.npmjs.com/package/nerror), and [pupa](https://www.npmjs.com/package/pupa). Its printing is done by [object-inspect](https://www.npmjs.com/package/object-inspect).

Errawr is unrelated to the Ruby package of the same (excellent) name.

## Usage

<!-- prettier-ignore -->
```js
import Errawr, { rawr, invariant } from 'errawr';

function rave(system) {
  invariant(system.status === 'up', rawr('The system is {system.status}'), { system });

  return '200 SBEMAILS';
}

export default function main() {
  try {
    rave({ status: 'down' });
  } catch(e) {
    // stringify your errors as far up the call stack as is possible.
    console.error(Errawr.print(e));

    /*
    Error: The system is {status: 'down'}
    at rave:4:2
    at main:11:4
    */
  }
}
```

The above example uses the `invariant` shorthand, which is equivalent to:

```js
if (system.status !== 'up') {
  throw new Errawr(rawr('The system is {system.status}'), {
    info: { system },
  });
}
```

If you don't need or want templating you can always omit `rawr`. Note that it may still be useful to provide relevant info: though it won't end up in the logs it will still be visible to you while debugging.

```js
new Errawr('The system is not up', { info: { system } });
```

## Differences with VError

If you're already familiar with VError, here's what's changed:

- `new VError(options, 'reason')` has become `new Errawr('reason', options)`
- `verror.cause()` is now `errawr.cause` (i.e. not a function). This aligns with the new spec.
- There is no `MultiError`. Instead use the builtin `AggregateError`.
- There is no distinction between `VError` and `SError`. Presentation details have no place at the bottom of a class hierarchy. Instead you should handle message interpolation yourself. You may use the provided `rawr` function to do basic interpolation.
- `VError.fullStack(error)` is `Errawr.print(error)`
- causes are now in now an iterable returned from `Errawr.chain(err)`
  - Instead of `VError.findCauseByName(err)` use `find(hasName(name, cause), Errawr.chain(err))`
  - Instead of `VError.hasCauseWithName(err)` use `some(hasName(name, cause), Errawr.chain(err))`
  - `find` or `some` methods are provided by your favorite [iterator tools](https://github.com/iter-tools/iter-tools/blob/trunk/API.md).
- `constructorFn` is now called `topFrame`
- There is no strict mode. Serialization of interpolated values is best-effort.
