export declare type Gettable = Array<any> | Record<string, any>;
export declare type Interpolator = (data: Gettable) => string;
export declare type Options = {
    info?: Gettable;
    code?: any;
    cause?: any;
    topFrame?: Function;
};
export declare type InvariantOptions = Options & {
    ctor?: Function;
};
export default class Errawr extends Error {
    info: Record<string, any>;
    static rawr(template: string): (data: any) => any;
    static print(err: Error): string;
    static info(err: Error): Record<string, any>;
    static chain(err: Error): Iterable<Error>;
    static invariant(condition: false, reason: string | Interpolator, info?: Gettable): never;
    static invariant(condition: any, reason: string | Interpolator, info?: Gettable): asserts condition;
    constructor(reason: string | Interpolator, options?: Options);
    chain(): Iterable<Error>;
}
