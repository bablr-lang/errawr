"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rawr_1 = __importDefault(require("./rawr"));
const helpers_1 = require("./helpers");
// TODO: how to handle AggregateErrors
class Errawr extends Error {
    static get rawr() {
        return rawr_1.default;
    }
    static print(err) {
        let str = '';
        let first = true;
        for (const cause of Errawr.chain(err)) {
            if (!first) {
                str += '\nCaused by: ';
            }
            const header = `${cause.name}: ${cause.message}`;
            str += header;
            if (cause.stack) {
                let stack = cause.stack;
                if (stack.startsWith(header)) {
                    stack = stack.slice(header.length + 1);
                }
                str += '\n' + stack;
            }
            first = false;
        }
        return str;
    }
    static info(err) {
        // Should I be worried about name shadowing? How much?
        return [...Errawr.chain(err)].reverse().reduce((info, cause) => {
            Object.assign(info, cause.info);
            return info;
        }, {});
    }
    static chain(err) {
        return {
            *[Symbol.iterator]() {
                let cause = err;
                while (true) {
                    if ((0, helpers_1.isError)(cause)) {
                        yield cause;
                    }
                    else {
                        break;
                    }
                    cause = typeof cause.cause === 'function' ? cause.cause() : cause.cause;
                }
            },
        };
    }
    static invariant(condition, reason, info) {
        if (!condition) {
            // i.e. TypeError.invariant(...) or invariant.call(TypeError, ...)
            const ctor = typeof this === 'function' ? this : Errawr;
            throw new ctor(reason, { info });
        }
    }
    constructor(reason, options) {
        const { info, cause, code, topFrame } = options || {};
        let reason_ = typeof reason === 'function' ? reason(info) : reason;
        // @ts-ignore
        super(reason_);
        Object.defineProperty(this, 'cause', {
            value: cause,
            writable: true,
            enumerable: false,
            configurable: true,
        });
        Object.defineProperty(this, 'code', {
            value: code,
            writable: true,
            enumerable: false,
            configurable: true,
        });
        Object.defineProperty(this, 'info', {
            value: info,
            writable: true,
            enumerable: false,
            configurable: true,
        });
        Error.captureStackTrace(this, topFrame || this.constructor);
    }
    chain() {
        return Errawr.chain(this);
    }
}
exports.default = Errawr;
