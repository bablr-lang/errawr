const { stripIndent } = require('common-tags');
const { rawr } = require('..');

describe('rawr', () => {
  it('can be used as a function', () => {
    expect(typeof rawr('foo')).toBe('function');
    expect(rawr('foo')()).toBe('foo');
  });

  it('can be used as a tagged template', () => {
    expect(rawr`bar`()).toBe('bar');
  });

  describe('the template string', () => {
    it('may be empty', () => {
      expect(rawr``()).toBe('');
    });

    it('may contain special characters', () => {
      expect(rawr`:.`()).toBe(':.');
    });

    it('may interpolate from passed data', () => {
      expect(rawr`Hello {who}`({ who: 'world' })).toBe(`Hello {who: 'world'}`);
      expect(rawr`Hello {who:world}`({ world: 'world' })).toBe(`Hello {who: 'world'}`);
      expect(rawr`Hello {nested.who}`({ nested: { who: 'world' } })).toBe(`Hello {who: 'world'}`);
      expect(rawr`Hello {who:nested.world}`({ nested: { world: 'world' } })).toBe(
        `Hello {who: 'world'}`,
      );

      const resultWithExtra = stripIndent`
        Hello {who: 'world'}
          { prop: 'value' }
      `;
      expect(rawr`Hello {who}`({ who: 'world', prop: 'value' })).toBe(resultWithExtra);
    });
  });
});
