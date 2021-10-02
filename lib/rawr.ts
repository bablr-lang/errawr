// Adapted from pupa Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

import inspect from 'object-inspect';

const getIn = (obj, keyParts) => {
  let value = obj;

  for (const keyPart of keyParts) {
    value = value ? value[keyPart] : undefined;
  }

  return value;
};

export default function rawr(template) {
  if (typeof template !== 'string') {
    throw new TypeError(`Expected a string for {template: ${template}}`);
  }

  if (/{}/.test(template)) {
    throw new Error(`Unexpected {} in {template: \`${template}\`}`);
  }

  const braceRegex = /{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}/gi;

  return (data) => {
    return template.replace(braceRegex, (_: string, key: string): string => {
      const keyParts = key.split('.');
      const lastPart = keyParts[keyParts.length - 1];
      return inspect({ [lastPart]: getIn(data, keyParts) });
    });
  };
}
