# claude-mermaid (plugin `mermaid-canvas`)

A Claude Code plugin that draws mermaid diagrams in the desktop chat: an MCP
server whose `mermaid` tool the host renders as an MCP App (the viewer page), a
SessionStart hook that tells Claude to use it there, and the viewer itself.

## Layout

| Path | What it is |
|---|---|
| `.claude-plugin/` | plugin manifest and the marketplace entry that installs it |
| `hooks/hooks.json`, `hooks/session-start.mjs` | in the desktop app only: "diagrams go through the `mermaid` tool" |
| `mcp/server.mjs` (named in `plugin.json` `mcpServers`) | the MCP server, stdio, no dependencies: tool `mermaid`, resource `ui://mermaid-canvas/viewer.html` |
| `viewer/app.js` | the viewer as an MCP App: handshake with the host, draws the call's `source` |
| `dist/viewer.html` | the page the server serves, built by `npm run build`; committed, an installed plugin has no build step |
| `viewer/view.js` | the viewer: canvas, dock, zoom, render queue |
| `viewer/themes/` | one file per theme, registered in `index.js` |
| `viewer/statuses.js` | status classes the themes paint |
| `viewer/highlight.js` | source view highlighting |
| `demo/index.html` | local page for trying the viewer |
| `README.md`, `docs/readmes/README.ru.md` | the same README in English and Russian: a change goes into both |
| `assets/` | logo and the README screenshots, captured from `demo/host.html` |
| `demo/host.html` | a stand-in MCP Apps host framing `dist/viewer.html` (`?theme=light`) |
| `test/` | `node --test` suites, no browser needed |

## Commands

```bash
npm run check
```

Runs Biome (lint and format check) and the tests; CI runs the same. After a change
under `viewer/`, `npm run build`: a test fails while `dist/viewer.html` is stale. `npm run format`
fixes formatting. The demo runs from `.claude/launch.json` (`claude-mermaid`, port
8765): open `http://localhost:8765/demo/`.

## Rules

- The viewer runs inside the chat widget sandbox: external code only from
  `cdn.jsdelivr.net`, `esm.sh`, `unpkg.com`, `cdnjs.cloudflare.com`, fonts only
  from Google Fonts. Every URL pins an exact version.
- Host pages style elements outside cascade layers, which beats Tailwind's layered
  utilities: utilities are `!important`, and svg icon styles are pinned in `CSS`.
- Mermaid draws into a scratch box inside the canvas, never into `<body>`: a
  temporary node there resizes the widget frame and the chat jumps.
- A theme repaints every status in both modes; `test/themes.test.js` holds that.
- A release bumps `version` in `plugin.json` and the tag in README's viewer URL
  together, then tags `v<version>`; `test/plugin.test.js` holds the pair.
- Examples and demos stay neutral: no names of real projects, companies or people.
