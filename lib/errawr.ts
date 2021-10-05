import Error from 'error-cause/Error';
import rawr from './rawr';

export type Gettable = Array<any> | Record<string, any>;
export type Interpolator = (data: Gettable) => string;
export type Options = { info?: Gettable; cause?: any };
export type InvariantOptions = Options & { ctor?: Function };

const toString = (o) => {
  return Object.prototype.toString.call(o);
};

const isError = (e): e is Error => {
  return toString(e) === '[object Error]' || e instanceof Error;
};

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
      str += `${cause.name}: ${cause.message}`;
      if (cause.stack) {
        if (cause.stack.startsWith(`${cause.name}: `)) {
          cause.stack.split('\n').slice(1).join('\n');
        }
        str += '\n' + cause.stack;
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
      const ctor: any = this ?? Errawr;

      const error = new ctor(reason, { info });

      Error.captureStackTrace(error, ctor.invariant);

      throw error;
    }
  }

  constructor(reason: string | Interpolator, options?: Options) {
    const { info, cause } = options;

    let reason_ = typeof reason === 'function' ? reason(info) : reason;

    super(reason_, { cause });

    this.info = info;
  }

  chain(): Iterable<Error> {
    return Errawr.chain(this);
  }
}
