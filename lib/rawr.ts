// Adapted from pupa Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

import type { Interpolator } from './errawr';

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
  name: string;
  parts: Array<string>;
  doubleCurly: boolean;
  start: number;
  end: number;
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
  let partial = '';
  let key: KeyNode = null;

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
    } else if (str[i] === '\\') {
      if (escaped) {
        partial += '\\';
      }
      escaped = !escaped;
    } else if (str[i] === '{') {
      if (key !== null) {
        throw new SyntaxError(
          `invalid {character: ${str[i]}} at {position: ${i}} in {template: ${template}}`,
        );
      }

      key = { name: null, parts: [], doubleCurly: false, start: i + 1, end: -1 };

      if (str[i + 1] === '{') {
        key.doubleCurly = true;
        i++;
      }

      literals.push(partial);
      partial = '';

      keys.push(key);
    } else if (str[i] === '}') {
      if (key !== null) {
        if (key.start === i) {
          throw new SyntaxError(
            `empty {braces: \`${key.doubleCurly ? '{{}}' : '{}'}\`} at {position: ${
              i - (key.doubleCurly ? 2 : 1)
            }} in {template: ${template}}`,
          );
        }
        if ((key.doubleCurly && str[i + 1] !== '}') || (!key.doubleCurly && str[i + 1] === '}')) {
          throw new SyntaxError(
            `mismatched braces at {start: ${key.start}, end: ${
              key.doubleCurly ? i : i + 1
            }} in {template: ${template}}`,
          );
        }
        if (key.doubleCurly) {
          i++;
        }

        key.name = key.name || partial;
        key.end = i - 1;
        pushKeyPart();
        key = null;
      }
    } else if (key !== null) {
      if (str[i] === '.') {
        pushKeyPart();
      } else if (str[i] === ':') {
        if (partial === '') {
          throw new SyntaxError(
            `Unexpected character at {pos: ${i}}: key cannot have an empty name`,
          );
        } else if (key.parts.length) {
          throw new SyntaxError(`key name must not have multiple parts`);
        }
        key.name = partial;
        partial = '';
      } else {
        partial += str[i];
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
  const values = keys.map(({ name, parts }) => {
    return `{${name}: ${inspect(getIn(props, parts))}}`;
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

const rawr = (template: string | Array<string>, ...values: Array<unknown>): Interpolator => {
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
