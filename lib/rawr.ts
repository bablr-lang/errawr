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

      if (keyStart != null) {
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
    } else if (str[i] === '}') {
      if (!/\d+|[a-zA-Z$_][\w\-$]*?(?:\.[\w\-$]*?)*?/.test(partial)) {
        throw new Error(`invalid interpolated {key: ${partial}}`);
      }
      keys.push({ parts: partial.split('.'), doubleCurly });

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
      doubleCurly = false;
      keyStart = null;
      partial = '';
    } else {
      partial += str[i];
    }
    i++;

    return { literals, keys };
  }
};

const interpolate = (literals: Array<String>, ...keys: Array<string>) => {
  let i = 0;
  let str = '';
  for (const literal of literals) {
    str += literal;
    str += keys[i];
    i++;
  }
  return str;
};

export default function rawr(template) {
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

    interpolate(literals, ...values);
  };
}
