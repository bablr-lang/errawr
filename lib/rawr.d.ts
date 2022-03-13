export declare type KeyNode = {
    parts: Array<string>;
    doubleCurly: boolean;
};
export declare const parse: (template: string) => {
    literals: Array<string>;
    keys: Array<KeyNode>;
};
declare const rawr: (template: string | Array<string>, ...values: Array<unknown>) => (props: Record<string, unknown>) => string;
export default rawr;
