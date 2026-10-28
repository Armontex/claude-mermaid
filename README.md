<div align="center">

<img src="assets/logo.svg" alt="" width="112" />

<h1>mermaid-canvas</h1>

<h3>Mermaid diagrams drawn in the Claude chat, not printed as code.</h3>

<p>
  A Claude Code plugin for the Claude desktop app.<br />
  Claude draws a diagram inline, on a canvas you can zoom, pan, restyle and copy from.
</p>

<p><strong>English</strong> · <a href="docs/readmes/README.ru.md">Русский</a></p>

<p>
  <a href="https://github.com/Armontex/claude-mermaid/actions/workflows/check.yml"><img alt="CI" src="https://github.com/Armontex/claude-mermaid/actions/workflows/check.yml/badge.svg" /></a>
  <a href="https://docs.claude.com/en/docs/claude-code/plugins"><img alt="Claude Code plugin" src="https://img.shields.io/badge/Claude%20Code-plugin-D97757" /></a>
  <a href="https://mermaid.js.org/"><img alt="Mermaid 12.2" src="https://img.shields.io/badge/Mermaid-12.2-FF3670?logo=mermaid&amp;logoColor=white" /></a>
  <a href="https://modelcontextprotocol.io/"><img alt="MCP Apps" src="https://img.shields.io/badge/MCP-Apps-3B82F6" /></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/License-MIT-22A699.svg" /></a>
  <a href="#project-status"><img alt="Stable" src="https://img.shields.io/badge/Status-Stable-2EA043" /></a>
</p>

<p>
  <a href="#why">Overview</a> ·
  <a href="#installation">Installation</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#development">Development</a> ·
  <a href="#roadmap">Roadmap</a>
</p>

</div>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/demo-dark.png" />
    <img src="assets/demo-light.png" alt="A flowchart drawn between two paragraphs of a reply, with the zoom, theme and source controls docked under it" width="900" />
  </picture>
</p>

<p align="center"><sub>Captured from <code>demo/host.html</code>, the stand-in host the viewer is tested in. In the app the canvas sits inside a reply the same way.</sub></p>

---

## Why

The Claude desktop app prints a ` ```mermaid ` block as plain text: a diagram
you have to read as source or paste somewhere else. mermaid-canvas gives Claude
a `mermaid` tool instead, and the app draws each call as a live canvas in the
middle of the reply.

| Without the plugin                   | With it                                                   |
| ------------------------------------ | --------------------------------------------------------- |
| A code block with the mermaid source | The drawn diagram, between the paragraphs about it        |
| Copy it out to see it                | Zoom, pan, fit, switch theme, flip to the source and back |
| One look in light and dark           | The canvas opens in the app's theme                       |

Claude passes the same mermaid source it would have put in a code block, so a
diagram costs no more tokens than before.

## How it works

1. The plugin starts a small MCP server. Its one tool, `mermaid({ source })`,
   names a page of its own (`ui://mermaid-canvas/viewer-<hash>.html`), which
   makes it an [MCP App](https://modelcontextprotocol.io/).
2. In the desktop app a `SessionStart` hook tells Claude to draw diagrams with
   that tool instead of writing a code block.
3. When Claude calls it, the app frames the page in the reply and hands it the
   call's `source`; the page renders it with Mermaid, in the app's theme.

The diagram is rendered on your machine, inside that frame: its source is not
sent anywhere. The page loads Mermaid from esm.sh, Tailwind from jsDelivr and
JetBrains Mono from Google Fonts.

## Highlights

- **Every Mermaid diagram type** — flowcharts, sequence, class, state, ER,
  Gantt, mindmaps and the rest of Mermaid 12.
- **A real canvas** — drag to pan, wheel to zoom at the pointer, double-click
  to zoom in, one button to fit.
- **Three themes, light and dark** — `live`, `ink` and `print`; the canvas
  opens in the app's theme.
- **Source view** — line numbers, highlighting and a copy button.
- **Status classes** — mark nodes as done, missing, blocked, in progress or at
  risk, and the theme paints them.
- **Nothing to install but the plugin** — the server has no dependencies and
  the page ships built.
- **No stale viewer** — the page is named by its content, so after an update
  the app cannot serve the old one from its cache.

## Installation

Requirements:

- the Claude desktop app with Claude Code (the Code tab);
- Node.js 18 or newer on `PATH`.

```bash
claude plugin marketplace add Armontex/claude-mermaid && claude plugin install mermaid-canvas@mermaid-canvas
```

Or inside Claude Code: `/plugin marketplace add Armontex/claude-mermaid`, then
`/plugin install mermaid-canvas@mermaid-canvas`.

Start a new session afterwards: the server and the hook load when a session
starts.

### Updating

```bash
claude plugin marketplace update mermaid-canvas && claude plugin update mermaid-canvas@mermaid-canvas
```

## Usage

Ask for a diagram, or for anything a diagram explains: "draw the checkout
flow", "show how these services talk to each other". Claude calls `mermaid`,
and the canvas appears in the reply.

### On the canvas

| Do                                                    | To                                   |
| ----------------------------------------------------- | ------------------------------------ |
| Drag                                                  | Pan                                  |
| Wheel after a click, Ctrl/⌘ + wheel, or a pinch       | Zoom at the pointer                  |
| Double-click                                          | Zoom in                              |
| `−` / `+`                                             | Zoom out / in                        |
| The percentage                                        | Fit the diagram to the canvas        |
| `↕`                                                   | Make the canvas taller, and back     |
| A swatch                                              | Switch theme: `live`, `ink`, `print` |
| Sun / moon                                            | Light or dark canvas                 |
| `</>`                                                 | Show the source, with a copy button  |

A plain wheel over a canvas you have not clicked scrolls the chat, so reading
past a diagram never zooms it by accident.

### Status classes

Five classes are painted by every theme in both modes, in flowcharts and state
diagrams. Claude uses them when a diagram shows the state of work:

| Class     | Means                   |
| --------- | ----------------------- |
| `ok`      | done, works             |
| `none`    | missing, not started    |
| `blocked` | waiting on someone else |
| `ours`    | the work in progress    |
| `warn`    | at risk                 |

```text
flowchart LR
  Cart:::ok --> Checkout:::ours --> Gateway:::blocked
```

They need no `classDef`; one written for them is replaced by the theme's.

### Use the viewer anywhere

The viewer is a plain ES module and works on any page:

```html
<div id="d"></div>
<script type="module">
  import view from 'https://cdn.jsdelivr.net/gh/Armontex/claude-mermaid@v1.0.0/viewer/view.js';
  view('d', `flowchart LR
    A:::ok --> B:::blocked`);
</script>
```

## Project status

`1.0.0` is the first stable release: the canvas draws in the desktop app, and
the tool, its input and the status classes stay as they are until a `2.0`.

| Where                            | What you get                                              |
| -------------------------------- | --------------------------------------------------------- |
| Claude desktop app, Code tab     | The canvas, inline in the reply                           |
| Claude Code in a terminal        | The hook stays silent; Claude writes a regular code block |
| Other hosts that render MCP Apps | Expected to work, not tested yet                          |

## Quality and testing

```bash
npm run check
```

Biome checks formatting and lint, then `node --test` runs the suites:

- the server's protocol: the tool, its page, the allowed CDN domains, errors;
- `dist/viewer.html` matches a fresh build of the current sources;
- every theme paints every status class in both modes;
- the source highlighter and the status-class rewrite;
- the `SessionStart` hook speaks in the desktop app only;
- the plugin manifest, the marketplace entry and the release tag agree.

`demo/host.html` is a stand-in MCP Apps host: it frames `dist/viewer.html`,
answers its handshake and hands it a diagram, dark by default or with
`?theme=light`.

## Development

```bash
npm ci
npm run check
```

| Command          | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `npm run check`  | Biome and the full test suite, as CI runs them |
| `npm run build`  | Bundle the viewer into `dist/viewer.html`      |
| `npm run format` | Fix formatting                                 |
| `npm test`       | The test suite alone                           |

After a change under `viewer/`, run `npm run build`: the built page is
committed, since an installed plugin has no build step.

To run your checkout as the plugin:

```bash
claude plugin marketplace add "$PWD" && claude plugin install mermaid-canvas@mermaid-canvas
```

The plugin is then read straight from the folder, and each new session picks
up the changes.

Serve the repository (`python3 -m http.server`) and open `demo/` for the viewer
alone, or `demo/host.html` for the viewer as an MCP App.

### Releasing

1. Raise `version` in `.claude-plugin/plugin.json` and the tag in the viewer
   URL above together; a test holds the pair.
2. Tag the release commit `v<version>` and push the tag.

### Project structure

```text
.claude-plugin/   # plugin manifest (with the MCP server) and marketplace entry
hooks/            # SessionStart: draw diagrams with the mermaid tool
mcp/server.mjs    # MCP server over stdio, no dependencies
viewer/
├── view.js       # the canvas: render queue, zoom, pan, dock
├── app.js        # the canvas as an MCP App: the handshake with the host
├── themes/       # one file per theme, registered in index.js
├── statuses.js   # the status classes themes paint
└── highlight.js  # the source view
dist/viewer.html  # built by npm run build, served by the server
demo/             # the viewer page and a stand-in MCP Apps host
test/             # node --test suites
```

## Roadmap

- [ ] Follow a theme switch in the app while a diagram is open.
- [ ] Export the drawing as SVG and PNG.
- [ ] Check other MCP Apps hosts, claude.ai on the web first.
- [ ] Publish to the Claude Code plugin directory.

## Troubleshooting

**Claude still writes a code block.** Start a new session after installing:
the hook runs when a session starts. `claude plugin list` should show
`mermaid-canvas@mermaid-canvas` enabled.

**The call shows, the canvas does not.** Check that the server is up:

```bash
claude mcp list
```

`plugin:mermaid-canvas:mermaid-canvas` should read `✔ Connected`; if it does
not, check that `node --version` is 18 or newer.

**The wheel scrolls the chat.** That is by design: click the canvas first, or
hold Ctrl/⌘ while scrolling.

Remove the plugin:

```bash
claude plugin uninstall mermaid-canvas@mermaid-canvas
```

## License

mermaid-canvas is available under the [MIT License](LICENSE).
