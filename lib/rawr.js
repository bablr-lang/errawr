"use strict";
// Adapted from pupa Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const object_inspect_1 = __importDefault(require("object-inspect"));
const { hasOwnProperty } = Object.prototype;
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
    let partial = '';
    let key = null;
    const pushKeyPart = () => {
        if (!partial) {
            throw new SyntaxError(`empty key segment at {position: ${i}} in {template: ${template}}`);
        }
        keys[keys.length - 1].parts.push(partial);
        partial = '';
    };
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
            if (key !== null) {
                throw new SyntaxError(`invalid {character: ${str[i]}} at {position: ${i}} in {template: ${template}}`);
            }
            key = { name: null, parts: [], doubleCurly: false, start: i + 1, end: -1 };
            if (str[i + 1] === '{') {
                key.doubleCurly = true;
                i++;
            }
            literals.push(partial);
            partial = '';
            keys.push(key);
        }
        else if (str[i] === '}') {
            if (key !== null) {
                if (key.start === i) {
                    throw new SyntaxError(`empty {braces: \`${key.doubleCurly ? '{{}}' : '{}'}\`} at {position: ${i - (key.doubleCurly ? 2 : 1)}} in {template: ${template}}`);
                }
                if ((key.doubleCurly && str[i + 1] !== '}') || (!key.doubleCurly && str[i + 1] === '}')) {
                    throw new SyntaxError(`mismatched braces at {start: ${key.start}, end: ${key.doubleCurly ? i : i + 1}} in {template: ${template}}`);
                }
                if (key.doubleCurly) {
                    i++;
                }
                key.name = key.name || partial;
                key.end = i - 1;
                pushKeyPart();
                key = null;
            }
        }
        else if (key !== null) {
            if (str[i] === '.') {
                pushKeyPart();
            }
            else if (str[i] === ':') {
                if (partial === '') {
                    throw new SyntaxError(`Unexpected character at {pos: ${i}}: key cannot have an empty name`);
                }
                else if (key.parts.length) {
                    throw new SyntaxError(`key name must not have multiple parts`);
                }
                key.name = partial;
                partial = '';
            }
            else {
                partial += str[i];
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
const rawrInterpolate = (literals, keys, props, options) => {
    const values = keys.map(({ name, parts }) => {
        return `{${name}: ${(0, object_inspect_1.default)(getIn(props, parts))}}`;
    });
    let interpolated = interpolate(literals, ...values);
    if (options.rest) {
        const used = {};
        const lines = [];
        for (const key of keys) {
            used[key.parts[0]] = true;
        }
        for (const key in props) {
            if (hasOwnProperty.call(props, key) && !used.hasOwnProperty(key)) {
                lines.push((0, object_inspect_1.default)({ [key]: props[key] }));
            }
        }
        if (lines.length > 0) {
            interpolated += '\n  ' + lines.join('\n  ');
        }
    }
    return interpolated;
};
const defaultOptions = {
    rest: true,
};
const assertValidKeys = (keys) => {
    for (const key of keys) {
        if (key.doubleCurly) {
            throw new SyntaxError('{{}} interpolation is reserved');
        }
    }
};
const rawr = (template, ...values) => {
    if (Array.isArray(template)) {
        // rawr`${str}{prop}` => props => string
        const { literals, keys } = (0, exports.parse)(interpolate(template, ...values));
        assertValidKeys(keys);
        return (props) => rawrInterpolate(literals, keys, props, defaultOptions);
    }
    else {
        // rawr('{prop}') => props => string
        let [options = defaultOptions] = values;
        const { literals, keys } = (0, exports.parse)(template);
        assertValidKeys(keys);
        if (options && typeof options === 'object') {
            options = Object.assign(Object.assign({}, defaultOptions), options);
        }
        return (props) => rawrInterpolate(literals, keys, props, options);
    }
};
exports.default = rawr;
