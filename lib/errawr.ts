import Error from 'error-cause/Error';
import rawr from './rawr';

export type Interpolator = (data: Array<any> | Record<string, any>) => string;
export type Options = { info: Record<string, any>; cause: any };

// TODO: how to handle AggregateErrors

export default class Errawr extends Error {
  info: Record<string, any>;

  static rawr(template: string) {
    return rawr(template);
  }

  static print(error: unknown) {}

  static info(error: unknown) {}

  static findCauseByName(error: unknown, name: string) {}

  static hasCauseWithName(error: unknown, name: string) {}

  constructor(reason: string | Interpolator, options: Options) {
    const { info, cause } = options;

    if (typeof reason === 'function') {
      reason(info);
    }

    super(reason, { cause });

    this.info = info;
  }
}
