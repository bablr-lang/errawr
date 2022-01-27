import rawr from './rawr';
import { isError } from './helpers';

export type Gettable = Array<any> | Record<string, any>;
export type Interpolator = (data: Gettable) => string;
export type Options = { info?: Gettable; cause?: any; topFrame?: Function };
export type InvariantOptions = Options & { ctor?: Function };

// TODO: how to handle AggregateErrors

export default class Errawr extends Error {
  info: Record<string, any>;

  static rawr(template: string) {
    return rawr(template);
  }

  static print(err: Error): string {
    let str = '';
    let first = true;
    for (const cause of Errawr.chain(err)) {
      if (!first) {
        str += '\nCaused by: ';
      }

      const header = `${cause.name}: ${cause.message}`;
      str += header;

      if (cause.stack) {
        let stack = cause.stack;
        if (stack.startsWith(header)) {
          stack = stack.slice(header.length);
        }

        str += '\n' + stack;
      }

      first = false;
    }
    return str;
  }

  static info(err: Error): Record<string, any> {
    // Should I be worried about name shadowing? How much?
    return [...Errawr.chain(err)].reverse().reduce((info, cause) => {
      Object.assign(info, (cause as any).info);
      return info;
    }, {});
  }

  static chain(err: Error): Iterable<Error> {
    return {
      *[Symbol.iterator]() {
        for (let cause: unknown = err; isError(cause); cause = cause.cause) {
          if (typeof cause === 'function') {
            // VError compatibility
            yield (cause as any)();
          }
          yield cause;
        }
      },
    };
  }

  static invariant(condition: false, reason: string | Interpolator, info?: Gettable): never;
  static invariant(
    condition: any,
    reason: string | Interpolator,
    info?: Gettable,
  ): asserts condition;
  static invariant(condition: unknown, reason: string | Interpolator, info?: Gettable) {
    if (condition) {
      // i.e. TypeError.invariant(...) or invariant.call(TypeError, ...)
      const ctor: any = typeof this === 'function' ? this : Errawr;

      throw new ctor(reason, { info });
    }
  }

  constructor(reason: string | Interpolator, options?: Options) {
    const { info, cause, topFrame } = options || {};

    let reason_ = typeof reason === 'function' ? reason(info) : reason;

    // @ts-ignore
    super(reason_);

    Object.defineProperty(this, 'cause', {
      value: cause,
      writable: true,
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(this, 'info', {
      value: info,
      writable: true,
      enumerable: false,
      configurable: true,
    });

    Error.captureStackTrace(this, topFrame || this.constructor);
  }

  chain(): Iterable<Error> {
    return Errawr.chain(this);
  }
}
