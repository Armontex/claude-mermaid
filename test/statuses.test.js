import assert from 'node:assert/strict';
import { test } from 'node:test';
import { STATUSES, withStatuses } from '../viewer/statuses.js';

const paint = { ok: 'fill:#fff', none: 'fill:#000' };

test('theme status classes replace classDef of the same name in a flowchart', () => {
  const out = withStatuses('flowchart LR\n  A:::ok\n  classDef ok fill:#123', paint);
  assert.doesNotMatch(out, /fill:#123/);
  assert.match(out, /^classDef ok fill:#fff$/m);
  assert.match(out, /^classDef none fill:#000$/m);
});

test('other class names stay as written', () => {
  const out = withStatuses('graph TD\n  A:::mine\n  classDef mine fill:#abc', paint);
  assert.match(out, /classDef mine fill:#abc/);
});

test('leading comments and front matter do not hide the diagram type', () => {
  const out = withStatuses('%% note\nstateDiagram-v2\n  [*] --> A', paint);
  assert.match(out, /^classDef ok /m);
});

test('diagram types without classDef are left untouched', () => {
  const src = 'sequenceDiagram\n  A->>B: hi';
  assert.equal(withStatuses(src, paint), src);
});

test('the status list is the one the skill documents', () => {
  assert.deepEqual(STATUSES, ['ok', 'none', 'blocked', 'ours', 'warn']);
});
