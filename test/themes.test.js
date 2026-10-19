import assert from 'node:assert/strict';
import { test } from 'node:test';
import { STATUSES } from '../viewer/statuses.js';
import { DEFAULT_THEME, THEMES } from '../viewer/themes/index.js';

const HEX = /^#[0-9a-f]{6}$/i;

test('the default theme is live', () => {
  assert.equal(DEFAULT_THEME, 'live');
});

for (const [name, theme] of Object.entries(THEMES)) {
  test(`${name}: a two-colour swatch`, () => {
    assert.equal(theme.swatch.length, 2);
    for (const colour of theme.swatch) assert.match(colour, HEX);
  });

  for (const mode of ['light', 'dark']) {
    test(`${name} ${mode}: a mermaid theme and every status`, () => {
      const { config, statuses } = theme[mode];
      assert.equal(typeof config.theme, 'string');
      assert.deepEqual(Object.keys(statuses).sort(), [...STATUSES].sort());
      for (const style of Object.values(statuses)) assert.match(style, /fill:#[0-9a-f]{6}.*stroke:/i);
    });
  }
}
