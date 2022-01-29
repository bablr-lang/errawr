// Adapted from pupa Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

import inspect from 'object-inspect';

const getIn = (obj, keyParts) => {
  let value = obj;

  for (const keyPart of keyParts) {
    value = value ? value[keyPart] : undefined;
  }

  return value;
};

export type KeyNode = {
  parts: Array<string>;
  doubleCurly: boolean;
};

export const parse = (
  template: string,
): {
  literals: Array<string>;
  keys: Array<KeyNode>;
} => {
  const str = template;
  const literals: Array<string> = [];
  const keys: Array<KeyNode> = [];
  let i = 0;
  let escaped = false;
  let doubleCurly = false;
  let keyStart = null;
  let partial = '';

  while (i < str.length) {
    if (escaped) {
      partial += str[i];
    } else if (str[i] === '\\') {
      if (escaped) {
        partial += '\\';
      }
      escaped = !escaped;
    } else if (str[i] === '{') {
      literals.push(partial);

      if (keyStart !== null) {
        throw new Error(
          `invalid {character: ${str[i]}} at {position: ${i}} in {template: ${template}}`,
        );
      }

      doubleCurly = false;
      if (str[i + 1] === '{') {
        doubleCurly = true;
        i++;
      }
      keyStart = i + 1;
      partial = '';

      keys.push({ parts: [], doubleCurly });
    } else if (str[i] === '}') {
      if (keyStart === i) {
        throw new Error(
          `empty {braces: \`${doubleCurly ? '{{}}' : '{}'}\`} at {position: ${
            i - (doubleCurly ? 2 : 1)
          }} in {template: ${template}}`,
        );
      }
      if ((doubleCurly && str[i + 1] !== '}') || (!doubleCurly && str[i + 1] === '}')) {
        throw new Error(
          `mismatched braces at {start: ${keyStart}, end: ${
            doubleCurly ? i : i + 1
          }} in {template: ${template}}`,
        );
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
    } else if (str[i] === '.') {
      if (keyStart !== null) {
        if (!partial) {
          throw new Error(`empty key segment at {position: ${i}} in {template: ${template}}`);
        }

        keys[keys.length - 1].parts.push(partial);
        partial = '';
      }
    } else {
      partial += str[i];
    }
    i++;
  }

  literals.push(partial);

  return { literals, keys };
};

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

type RawrOptions = {
  rest?: boolean;
};

export default function rawr(template, options: RawrOptions = {}) {
  const { rest = true } = options;
  if (typeof template !== 'string') {
    throw new TypeError(`Expected a string for {template: ${template}}`);
  }

  const { literals, keys } = parse(template);

  return (data) => {
    const values = keys.map(({ parts, doubleCurly }) => {
      const lastPart = parts[parts.length - 1];
      const value = getIn(data, parts);
      return doubleCurly ? String(value) : inspect({ [lastPart]: value });
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
          lines.push(inspect({ [key]: data[key] }));
        }
      }

      if (lines.length > 0) {
        return interpolated + '\n  ' + lines.join('\n  ');
      }
    }
    return interpolated;
  };
}
