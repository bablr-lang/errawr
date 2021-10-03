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

  static print(err: unknown) {}

  static info(err: unknown) {}

  static findCauseByName(err: unknown, name: string): null | Error {
    for (let cause: unknown = err; isError(cause); cause = cause.cause) {
      if (cause.name == name) {
        return cause;
      }
    }

    return null;
  }

  static hasCauseWithName(err: unknown, name: string): boolean {
    return !!this.findCauseByName(err, name);
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
}
