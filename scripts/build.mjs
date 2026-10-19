// Bundles the viewer into dist/viewer.html, the page the MCP server hands the host.
// External https imports (mermaid, Tailwind) stay URLs: the page loads them itself.
import { writeFileSync } from 'node:fs';
import { build } from 'esbuild';

export async function viewerPage() {
  const { outputFiles } = await build({
    entryPoints: ['viewer/app.js'],
    bundle: true,
    format: 'esm',
    minify: true,
    external: ['https://*'],
    write: false,
  });
  const app = outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="light dark">
<style>html,body{margin:0;background:transparent}</style></head>
<body><div id="cm"></div><script type="module">${app}</script></body></html>
`;
}

if (import.meta.url === `file://${process.argv[1]}`) writeFileSync('dist/viewer.html', await viewerPage());
