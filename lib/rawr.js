"use strict";
// Adapted from pupa Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const object_inspect_1 = __importDefault(require("object-inspect"));
const getIn = (obj, keyParts) => {
    let value = obj;
    for (const keyPart of keyParts) {
        value = value ? value[keyPart] : undefined;
    }
    return value;
};
const parse = (template) => {
    const str = template;
    const literals = [];
    const keys = [];
    let i = 0;
    let escaped = false;
    let doubleCurly = false;
    let keyStart = null;
    let partial = '';
    while (i < str.length) {
        if (escaped) {
            partial += str[i];
        }
        else if (str[i] === '\\') {
            if (escaped) {
                partial += '\\';
            }
            escaped = !escaped;
        }
        else if (str[i] === '{') {
            literals.push(partial);
            if (keyStart !== null) {
                throw new Error(`invalid {character: ${str[i]}} at {position: ${i}} in {template: ${template}}`);
            }
            doubleCurly = false;
            if (str[i + 1] === '{') {
                doubleCurly = true;
                i++;
            }
            keyStart = i + 1;
            partial = '';
            keys.push({ parts: [], doubleCurly });
        }
        else if (str[i] === '}') {
            if (keyStart === i) {
                throw new Error(`empty {braces: \`${doubleCurly ? '{{}}' : '{}'}\`} at {position: ${i - (doubleCurly ? 2 : 1)}} in {template: ${template}}`);
            }
            if ((doubleCurly && str[i + 1] !== '}') || (!doubleCurly && str[i + 1] === '}')) {
                throw new Error(`mismatched braces at {start: ${keyStart}, end: ${doubleCurly ? i : i + 1}} in {template: ${template}}`);
            }
            if (doubleCurly) {
                i++;
            }
            if (!partial) {
                throw new Error(`empty key segment at {position: ${i}} in {template: ${template}}`);
            }
            keys[keys.length - 1].parts.push(partial);
            doubleCurly = false;
            keyStart = null;
            partial = '';
        }
        else if (str[i] === '.') {
            if (keyStart !== null) {
                if (!partial) {
                    throw new Error(`empty key segment at {position: ${i}} in {template: ${template}}`);
                }
                keys[keys.length - 1].parts.push(partial);
                partial = '';
            }
        }
        else {
            partial += str[i];
        }
        i++;
    }
    literals.push(partial);
    return { literals, keys };
};
exports.parse = parse;
const interpolate = (literals, ...values) => {
    let i = 0;
    let string = literals[i];
    for (const value of values) {
        i++;
        string += value;
        string += literals[i];
    }
    return string;
};
function rawr(template, options) {
    const { rest } = options;
    if (typeof template !== 'string') {
        throw new TypeError(`Expected a string for {template: ${template}}`);
    }
    const { literals, keys } = (0, exports.parse)(template);
    return (data) => {
        const values = keys.map(({ parts, doubleCurly }) => {
            const lastPart = parts[parts.length - 1];
            const value = getIn(data, parts);
            return doubleCurly ? String(value) : (0, object_inspect_1.default)({ [lastPart]: value });
        });
        const interpolated = interpolate(literals, ...values);
        if (rest) {
            const used = {};
            const lines = [];
            for (const key of keys) {
                used[key.parts[0]] = true;
            }
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key) && !used.hasOwnProperty(key)) {
                    lines.push((0, object_inspect_1.default)({ [key]: data[key] }));
                }
            }
            if (lines.length > 0) {
                return interpolated + '\n  ' + lines.join('\n  ');
            }
        }
        return interpolated;
    };
}
exports.default = rawr;
