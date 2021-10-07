import Error from 'error-cause/Error';
export declare const toString: (o: any) => any;
export declare const isError: (e: any) => e is Error;
export declare const hasName: (name: string, cause: any) => boolean;
