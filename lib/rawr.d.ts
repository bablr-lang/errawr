export declare type KeyNode = {
    parts: Array<string>;
    doubleCurly: boolean;
};
export declare const parse: (template: string) => {
    literals: Array<string>;
    keys: Array<KeyNode>;
};
declare type RawrOptions = {
    rest?: boolean;
};
export default function rawr(template: any, options?: RawrOptions): (data: any) => any;
export {};
