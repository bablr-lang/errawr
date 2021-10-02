# Errawr!

Errawr is indubitably the cutest library to help you get help from your errors. It is a semi-structured logger, which is to say that its output is meant to be somewhere in between natural language and JSON. This is particularly freeing because constructing error messages that always read like natural language is a) hard, and b) pointless. A semi-structured approach also makes errors far easier to write and read errors occur due to issues which are difficult to print, like empty strings where non-empty strings are expected, and even errors which arise from unprintable characters.

The project is inspired by the `error.cause` feature of the Ecmascript spec as well as a few existing packages, namely [verror](https://www.npmjs.com/package/verror), [nerror](https://www.npmjs.com/package/nerror), and [pupa](https://www.npmjs.com/package/pupa). Its printing is done by [object-inspect](https://www.npmjs.com/package/object-inspect).

Errawr is unrelated to the Ruby package of the same (excellent) name.

## Usage

<!-- prettier-ignore -->
```js
import Error, { rawr } from 'errawr';

function rave(system) {
  if (system.status === 'up') {
    // no rave for The Cheat today I guess
  } else {
    throw new Error(rawr('The system is {system.status}'), { name: 'SystemError', info: { system } });
  }
}

export default main() {
  try {
    rave({ status: 'down' });
  } catch(e) {
    // stringify your errors as far up the call stack as is possible.
    console.error(Errawr.printStack(e));

    /*
    SystemError: The system is {status: 'down'}
    at rave:7:4
    at main:13:4
    */
  }
}
```

## Differences with VError

If you're already familiar with VError, here's what's changed:

- `new VError(options, 'reason')` has become `new Errawr('reason', options)`
- `verror.cause()` is now `errawr.cause` (i.e. not a function). This aligns with the new spec.
- There is no `MultiError`. Instead use the builtin `AggregateError`.
- There is no distinction between `VError` and `SError`. Presentation details have no place at the bottom of a class hierarchy. Instead you should handle message interpolation yourself. You may use the provided `rawr` function to do basic interpolation.
- `VError.fullStack(error)` is `Errawr.print(error)`
- There is no strict mode. Serialization of interpolated values is best-effort.
