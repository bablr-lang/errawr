"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasName = exports.isError = exports.toString = void 0;
const Error_1 = __importDefault(require("error-cause/Error"));
const toString = (o) => {
    return Object.prototype.toString.call(o);
};
exports.toString = toString;
const isError = (e) => {
    return (0, exports.toString)(e) === '[object Error]' || e instanceof Error_1.default;
};
exports.isError = isError;
const hasName = (name, cause) => {
    if (cause != null && cause.name === name) {
        return true;
    }
};
exports.hasName = hasName;
