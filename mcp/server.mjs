#!/usr/bin/env node
// MCP server over stdio, no dependencies: one tool, `mermaid`, drawn by the host
// as an MCP App: the page is dist/viewer.html (`npm run build`).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const { version } = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/plugin.json'), 'utf8'));
const PAGE = readFileSync(join(ROOT, 'dist/viewer.html'), 'utf8');
// Hosts cache an app's page by its URI: naming it by content makes every build
// a new page, so an update never shows the old viewer.
const URI = `ui://mermaid-canvas/viewer-${createHash('sha256').update(PAGE).digest('hex').slice(0, 12)}.html`;
const MIME = 'text/html;profile=mcp-app';
// Mermaid's chunks, Tailwind and the mono font load from these at run time.
const DOMAINS = [
  'https://esm.sh',
  'https://cdn.jsdelivr.net',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

export const TOOL = {
  name: 'mermaid',
  title: 'Mermaid diagram',
  description:
    'Shows a mermaid diagram as a zoomable, pannable canvas with themes and a source view, inline in apps ' +
    'that draw MCP Apps (the Claude desktop app). Any mermaid diagram type works. Classes ok, none, blocked, ' +
    'ours and warn (`A:::ok`) are painted by the theme: done, missing, waiting on someone else, our work now, ' +
    'at risk; write no classDef for them.',
  inputSchema: {
    type: 'object',
    properties: { source: { type: 'string', description: 'The mermaid source, without the ``` fence.' } },
    required: ['source'],
  },
  annotations: { readOnlyHint: true },
  _meta: { ui: { resourceUri: URI }, 'ui/resourceUri': URI },
};

export function answer({ method, params }) {
  switch (method) {
    case 'initialize':
      return {
        protocolVersion: params?.protocolVersion ?? '2025-06-18',
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: 'mermaid-canvas', version },
      };
    case 'ping':
      return {};
    case 'tools/list':
      return { tools: [TOOL] };
    case 'tools/call':
      if (params?.name !== TOOL.name) throw new Error(`Unknown tool: ${params?.name}`);
      if (typeof params.arguments?.source !== 'string') throw new Error('source must be a string');
      return { content: [{ type: 'text', text: 'The diagram is shown to the user.' }] };
    case 'resources/list':
      return { resources: [{ uri: URI, name: 'Mermaid viewer', mimeType: MIME }] };
    case 'resources/read':
      if (params?.uri !== URI) throw new Error(`Unknown resource: ${params?.uri}`);
      return {
        contents: [{ uri: URI, mimeType: MIME, text: PAGE, _meta: { ui: { csp: { resourceDomains: DOMAINS } } } }],
      };
    default:
      throw Object.assign(new Error(`Method not found: ${method}`), { code: -32601 });
  }
}

function serve() {
  const reply = (message) => process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', ...message })}\n`);
  createInterface({ input: process.stdin }).on('line', (line) => {
    let request;
    try {
      request = JSON.parse(line);
    } catch {
      return reply({ id: null, error: { code: -32700, message: 'Parse error' } });
    }
    if (request.id === undefined) return; // a notification: nothing to answer
    try {
      reply({ id: request.id, result: answer(request) });
    } catch (error) {
      reply({ id: request.id, error: { code: error.code ?? -32603, message: error.message } });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) serve();
