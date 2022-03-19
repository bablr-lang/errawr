import type { Interpolator } from './errawr';
export declare type KeyNode = {
    name: string;
    parts: Array<string>;
    doubleCurly: boolean;
    start: number;
    end: number;
};
export declare const parse: (template: string) => {
    literals: Array<string>;
    keys: Array<KeyNode>;
};
declare const rawr: (template: string | Array<string>, ...values: Array<unknown>) => Interpolator;
export default rawr;
