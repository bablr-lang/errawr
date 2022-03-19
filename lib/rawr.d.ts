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
declare const rawr: (template: string | Array<string>, ...values: Array<unknown>) => (props: Record<string, unknown>) => string;
export default rawr;
