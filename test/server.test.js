import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { answer, TOOL } from '../mcp/server.mjs';
import { viewerPage } from '../scripts/build.mjs';

const URI = TOOL._meta.ui.resourceUri;

test('the tool points the host at the viewer page', () => {
  const { tools } = answer({ method: 'tools/list' });
  assert.deepEqual(tools, [TOOL]);
  assert.equal(TOOL._meta['ui/resourceUri'], URI);
  assert.deepEqual(TOOL.inputSchema.required, ['source']);
});

test('the viewer page is an MCP App with its CDN domains allowed', () => {
  const [page] = answer({ method: 'resources/read', params: { uri: URI } }).contents;
  assert.equal(page.mimeType, 'text/html;profile=mcp-app');
  assert.match(page.text, /ui\/initialize/);
  assert.ok(page._meta.ui.csp.resourceDomains.includes('https://esm.sh'));
});

test('a call needs a source and answers in text', () => {
  const ok = answer({ method: 'tools/call', params: { name: 'mermaid', arguments: { source: 'graph LR\nA-->B' } } });
  assert.equal(ok.content[0].type, 'text');
  assert.throws(() => answer({ method: 'tools/call', params: { name: 'mermaid', arguments: {} } }), /source/);
  assert.throws(
    () => answer({ method: 'nope' }),
    (error) => error.code === -32601,
  );
});

test('dist/viewer.html is built from the current viewer', async () => {
  assert.equal(readFileSync('dist/viewer.html', 'utf8'), await viewerPage(), 'run npm run build');
});
