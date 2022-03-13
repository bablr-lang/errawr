import Error from 'error-cause/Error';

export const toString = (o: any) => {
  return Object.prototype.toString.call(o);
};

export const isError = (e: any): e is Error => {
  return toString(e) === '[object Error]' || e instanceof Error;
};

export const hasName = (name: string, cause: any) => {
  if (cause != null && cause.name === name) {
    return true;
  }
};
