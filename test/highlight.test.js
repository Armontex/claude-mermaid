import assert from 'node:assert/strict';
import { test } from 'node:test';
import { highlight } from '../viewer/highlight.js';

test('one numbered line per source line', () => {
  const html = highlight('flowchart LR\n  A --> B');
  assert.equal(html.match(/class="cm-line"/g).length, 2);
  assert.match(html, /cm-ln">2</);
});

test('markup in the source is escaped', () => {
  const html = highlight('  A["x<br/>y"] --> B');
  assert.doesNotMatch(html, /<br\/>/);
  assert.match(html, /&lt;br\/&gt;/);
});

test('keywords, strings, edge labels, arrows and comments get their classes', () => {
  const html = highlight('flowchart LR\n  A["s"] -->|label| B\n  %% note');
  assert.match(html, /<span class="cm-k">flowchart<\/span>/);
  assert.match(html, /<span class="cm-s">"s"<\/span>/);
  assert.match(html, /<span class="cm-l">\|label\|<\/span>/);
  assert.match(html, /<span class="cm-a">--&gt;<\/span>/);
  assert.match(html, /<span class="cm-c"> {2}%% note<\/span>/);
});
