import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const plugin = JSON.parse(read('.claude-plugin/plugin.json'));
const marketplace = JSON.parse(read('.claude-plugin/marketplace.json'));

test('the marketplace lists this plugin from the repository root', () => {
  assert.deepEqual(
    marketplace.plugins.map((p) => [p.name, p.source]),
    [[plugin.name, './']],
  );
});

// README loads the viewer from a release tag: a release bumps the version and the tag together.
test('README points at the tag of the plugin version', () => {
  const tags = [...read('README.md').matchAll(/claude-mermaid@(v[\w.-]+)\//g)].map((m) => m[1]);
  assert.ok(tags.length > 0);
  for (const tag of tags) assert.equal(tag, `v${plugin.version}`);
});

test('the viewer introduces itself to the host with the plugin version', () => {
  assert.match(read('viewer/app.js'), new RegExp(`version: '${plugin.version}'`));
});

test('the session hook speaks only in the desktop app', () => {
  const run = (entrypoint) =>
    spawnSync('node', ['hooks/session-start.mjs'], { env: { ...process.env, CLAUDE_CODE_ENTRYPOINT: entrypoint } });
  assert.match(String(run('claude-desktop').stdout), /`mermaid` tool/);
  assert.equal(String(run('cli').stdout), '');
});
