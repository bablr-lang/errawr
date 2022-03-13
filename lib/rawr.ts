// Adapted from pupa Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

import inspect from 'object-inspect';

const { hasOwnProperty } = Object.prototype;

const getIn = (obj: Record<string, any>, keyParts: Array<string>) => {
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

const interpolate = (literals: Array<string>, ...values: Array<unknown>) => {
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

const rawrInterpolate = (
  literals: Array<string>,
  keys: Array<KeyNode>,
  props: Record<string, unknown>,
  options: RawrOptions,
) => {
  const values = keys.map(({ parts }) => {
    const lastPart = parts[parts.length - 1];
    return inspect({ [lastPart]: getIn(props, parts) });
  });

  let interpolated = interpolate(literals, ...values);

  if (options.rest) {
    const used: Record<string, boolean> = {};
    const lines: Array<string> = [];

    for (const key of keys) {
      used[key.parts[0]] = true;
    }

    for (const key in props) {
      if (hasOwnProperty.call(props, key) && !used.hasOwnProperty(key)) {
        lines.push(inspect({ [key]: props[key] }));
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

const assertValidKeys = (keys: Array<KeyNode>) => {
  for (const key of keys) {
    if (key.doubleCurly) {
      throw new SyntaxError('{{}} interpolation is reserved');
    }
  }
};

const rawr = (template: string | Array<string>, ...values: Array<unknown>) => {
  if (Array.isArray(template)) {
    // rawr`${str}{prop}` => props => string
    const { literals, keys } = parse(interpolate(template, ...values));

    assertValidKeys(keys);

    return (props: Record<string, unknown>) =>
      rawrInterpolate(literals, keys, props, defaultOptions);
  } else {
    // rawr('{prop}') => props => string
    let [options = defaultOptions] = values;
    const { literals, keys } = parse(template);

    assertValidKeys(keys);

    if (options && typeof options === 'object') {
      options = { ...defaultOptions, ...options };
    }

    return (props: Record<string, unknown>) => rawrInterpolate(literals, keys, props, options);
  }
};

export default rawr;
