// Mermaid viewer: a pannable, zoomable canvas with a floating dock.
// Usage: import view from '.../view.js'; view('target-id' | element, `<any mermaid diagram>`)
import mermaid from 'https://esm.sh/mermaid@12.2.0/dist/mermaid.esm.min.mjs';
import { mermaidConfig } from './config.js';
import { highlight } from './highlight.js';
import { withStatuses } from './statuses.js';
import { DEFAULT_THEME, THEMES } from './themes/index.js';

export { STATUSES } from './statuses.js';
export { THEMES } from './themes/index.js';

const TAILWIND = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.2.4';
const MONO_FONT = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap';

const STORE = { theme: 'claude-mermaid:theme', mode: 'claude-mermaid:mode' };
const GRID = 20;
const DOCK = 56;

// Utilities are !important: host pages (the chat widget) keep their own styles
// outside cascade layers, and unlayered rules beat Tailwind's layered utilities.
// `dark:` follows each viewer's own mode, not the OS.
const TW_CSS = `@import "tailwindcss" important;
@custom-variant dark (&:where([data-cm-mode=dark], [data-cm-mode=dark] *));`;
// Pinned against host pages (the chat widget) that style svg on their own.
const CSS = `
.cm-code{font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace!important;font-size:12.5px!important;line-height:1.7!important;font-variant-ligatures:none}
.cm-line{display:flex}
.cm-ln{flex:none;width:2.5em;padding-right:1em;text-align:right;color:#a8a29e;user-select:none}
.cm-k{color:#7c3aed}.cm-s{color:#0f766e}.cm-a{color:#c2410c}.cm-l{color:#1d4ed8}.cm-c{color:#a8a29e;font-style:italic}
[data-cm-mode=dark] .cm-ln{color:#52525b}
[data-cm-mode=dark] .cm-k{color:#c4b5fd}[data-cm-mode=dark] .cm-s{color:#5eead4}[data-cm-mode=dark] .cm-a{color:#fdba74}[data-cm-mode=dark] .cm-l{color:#93c5fd}[data-cm-mode=dark] .cm-c{color:#71717a}
.cm-ico{width:16px!important;height:16px!important;flex:none}
.cm-ico *{fill:none!important;stroke:currentColor!important;stroke-width:1.75!important;stroke-linecap:round;stroke-linejoin:round}
`;

// Tabler-style outline icons, inlined so the viewer needs no icon font.
const ICONS = {
  in: '<path d="M12 5v14M5 12h14"/>',
  out: '<path d="M5 12h14"/>',
  taller: '<path d="M8 7l4-4 4 4M8 17l4 4 4-4M12 3v18"/>',
  shorter: '<path d="M8 3l4 4 4-4M8 21l4-4 4 4M12 7v10"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M3 12h1M20 12h1M12 3v1M12 20v1M5.6 5.6l.7.7M18.4 5.6l-.7.7M17.7 17.7l.7.7M6.3 17.7l-.7.7"/>',
  moon: '<path d="M12 3h.4a7.5 7.5 0 0 0 7.9 12.4A9 9 0 1 1 12 3z"/>',
  code: '<path d="M7 8l-4 4 4 4M17 8l4 4-4 4M14 4l-4 16"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  diagram:
    '<rect x="3" y="4" width="7" height="6" rx="1.5"/><rect x="14" y="14" width="7" height="6" rx="1.5"/><path d="M6.5 10v4a3 3 0 0 0 3 3H14"/>',
};
const icon = (name) => `<svg class="cm-ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

const BTN =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-full p-0 text-zinc-600 transition-colors ' +
  'hover:bg-black/5 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-1 ' +
  'focus-visible:outline-sky-500 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100';
const button = (action, name, label) =>
  `<button type="button" data-a="${action}" class="${BTN}" aria-label="${label}" title="${label}">${icon(name)}</button>`;
const SEP = '<span class="mx-1 h-4 w-px shrink-0 bg-black/10 dark:bg-white/10" aria-hidden="true"></span>';

const swatch = (name, [a, b]) => `
  <button type="button" data-theme="${name}" title="${name}" aria-label="Theme ${name}"
    class="size-5 min-w-0 shrink-0 rounded-full p-0 ring-1 ring-black/15 ring-offset-2 ring-offset-white transition
      hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500
      aria-pressed:ring-2 aria-pressed:ring-zinc-900 dark:ring-white/20 dark:ring-offset-zinc-800
      dark:aria-pressed:ring-zinc-100"
    style="background:linear-gradient(135deg, ${a} 50%, ${b} 50%)"></button>`;

let seq = 0;
// mermaid.initialize is global: renders run one at a time so each gets its own theme.
let queue = Promise.resolve();
function render(config, src, scratch) {
  const full = mermaidConfig(mermaid.mermaidAPI.defaultConfig, config);
  const run = queue.then(() => {
    mermaid.initialize(full);
    return mermaid.render(`cm-${++seq}`, src, scratch);
  });
  queue = run.catch(() => {});
  return run;
}

function hostMode() {
  const mode = document.documentElement.dataset.mode;
  if (mode) return mode;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Last choice of theme and light/dark; storage may be blocked in a sandboxed frame.
function saved(key) {
  try {
    return localStorage.getItem(STORE[key]);
  } catch {
    return null;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(STORE[key], value);
  } catch {
    /* not persisted */
  }
}

// The clipboard API is often blocked in sandboxed frames: fall back to a selection.
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = Object.assign(document.createElement('textarea'), { value: text });
    area.style.cssText = 'position:fixed;opacity:0';
    document.body.append(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
}

let setup = null;
function injectAssets() {
  setup ??= new Promise((ready) => {
    const style = document.createElement('style');
    style.textContent = CSS;
    const tw = document.createElement('style');
    tw.type = 'text/tailwindcss';
    tw.textContent = TW_CSS;
    const font = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: MONO_FONT });
    const script = Object.assign(document.createElement('script'), { src: TAILWIND });
    script.onload = script.onerror = ready;
    document.head.append(style, tw, font, script);
  });
  return setup;
}

export default async function view(target, src) {
  const host = typeof target === 'string' ? document.getElementById(target) : target;
  await injectAssets();
  host.innerHTML = `
    <div data-cm class="group relative h-[460px] overflow-hidden rounded-2xl bg-stone-50 ring-1 ring-black/10
      select-none touch-none cursor-grab data-[big]:h-[860px] data-[drag]:cursor-grabbing
      dark:bg-zinc-900 dark:ring-white/10">
      <div data-grid class="absolute inset-0 text-black/10 dark:text-white/10"></div>
      <div data-inner class="absolute top-0 left-0 origin-top-left"></div>
      <div data-scratch class="invisible absolute inset-0 -z-10 overflow-hidden" aria-hidden="true"></div>
      <pre data-code class="cm-code absolute inset-0 m-0 hidden overflow-auto py-4 pr-5 pb-20 text-zinc-800
        select-text cursor-text whitespace-pre bg-stone-50 group-data-[src]:block
        dark:bg-zinc-900 dark:text-zinc-200"></pre>
      <div class="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-2">
        <div data-dock class="pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full
          bg-white/85 p-1 shadow-[0_1px_2px_rgba(0,0,0,.06),0_8px_24px_-8px_rgba(0,0,0,.18)] ring-1 ring-black/10
          backdrop-blur-md cursor-default dark:bg-zinc-800/85 dark:ring-white/10">
          <span class="contents group-data-[src]:hidden">
            ${button('out', 'out', 'Zoom out')}
            <button type="button" data-a="fit" data-pct title="Fit to view" aria-label="Fit to view"
              class="h-8 min-w-14 shrink-0 rounded-full px-2 text-xs font-medium tabular-nums text-zinc-700
              hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-sky-500 dark:text-zinc-300
              dark:hover:bg-white/10">100%</button>
            ${button('in', 'in', 'Zoom in')}
            ${SEP}
            ${button('tall', 'taller', 'Taller')}
            ${SEP}
            <span class="flex items-center gap-2 px-2">${Object.entries(THEMES)
              .map(([n, t]) => swatch(n, t.swatch))
              .join('')}</span>
            ${button('mode', 'moon', 'Dark canvas')}
            ${SEP}
          </span>
          <span class="hidden group-data-[src]:contents">${button('copy', 'copy', 'Copy code')}</span>
          ${button('code', 'code', 'Show code')}
        </div>
      </div>
    </div>`;
  const wrap = host.querySelector('[data-cm]');
  const grid = host.querySelector('[data-grid]');
  const inner = host.querySelector('[data-inner]');
  const pct = host.querySelector('[data-pct]');
  const modeButton = host.querySelector('[data-a="mode"]');
  host.querySelector('[data-code]').innerHTML = highlight(src);

  let mode = ['light', 'dark'].includes(saved('mode')) ? saved('mode') : hostMode();
  let themeName = THEMES[saved('theme')] ? saved('theme') : DEFAULT_THEME;
  let vb = null;
  let s = 1,
    x = 0,
    y = 0;
  let touched = false;

  const apply = () => {
    inner.style.transform = `translate(${x}px,${y}px) scale(${s})`;
    // The dot grid travels and scales with the diagram.
    const step = GRID * s;
    grid.style.backgroundImage = 'radial-gradient(circle, currentColor 1px, transparent 1.2px)';
    grid.style.backgroundSize = `${step}px ${step}px`;
    grid.style.backgroundPosition = `${x}px ${y}px`;
    pct.textContent = `${Math.round(s * 100)}%`;
  };

  const markChoices = () => {
    wrap.dataset.cmMode = mode;
    for (const b of host.querySelectorAll('[data-theme]')) b.ariaPressed = String(b.dataset.theme === themeName);
    const next = mode === 'dark' ? 'light' : 'dark';
    modeButton.innerHTML = icon(next === 'dark' ? 'moon' : 'sun');
    modeButton.title = modeButton.ariaLabel = next === 'dark' ? 'Dark canvas' : 'Light canvas';
  };

  // Returns false when the source does not parse; the error replaces the canvas.
  const draw = async () => {
    let svg;
    // Mermaid measures label text: fonts must be in before layout.
    await document.fonts.ready;
    try {
      const { config, statuses } = THEMES[themeName][mode];
      ({ svg } = await render(config, withStatuses(src, statuses), host.querySelector('[data-scratch]')));
    } catch (err) {
      const box = document.createElement('div');
      box.className =
        'rounded-2xl bg-red-50 p-4 font-mono text-xs whitespace-pre-wrap text-red-800 ring-1 ring-red-200';
      box.textContent = `This diagram does not parse.\n\n${err?.message ?? err}`;
      wrap.replaceWith(box);
      return false;
    }
    inner.innerHTML = svg;
    const el = inner.querySelector('svg');
    // Some diagram types come without a viewBox.
    if (!el.viewBox.baseVal?.width) {
      const b = el.getBBox();
      el.setAttribute('viewBox', `${b.x} ${b.y} ${b.width} ${b.height}`);
    }
    vb = el.viewBox.baseVal;
    el.setAttribute('width', vb.width);
    el.setAttribute('height', vb.height);
    el.style.maxWidth = 'none';
    el.style.display = 'block';
    markChoices();
    return true;
  };

  markChoices();
  if (!(await draw())) return;

  const zoomAt = (k, cx, cy) => {
    const next = Math.min(12, Math.max(0.2, s * k));
    x = cx - ((cx - x) * next) / s;
    y = cy - ((cy - y) * next) / s;
    s = next;
    apply();
  };
  // Leaves room at the bottom for the dock.
  const fit = () => {
    const w = wrap.clientWidth,
      h = wrap.clientHeight - DOCK;
    s = Math.min(w / vb.width, h / vb.height) * 0.92;
    x = (w - vb.width * s) / 2;
    y = (h - vb.height * s) / 2;
    apply();
  };
  const local = (e) => {
    const r = wrap.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const center = () => [wrap.clientWidth / 2, (wrap.clientHeight - DOCK) / 2];
  const showingCode = () => 'src' in wrap.dataset;
  const onDock = (e) => e.target.closest('[data-dock]');

  // Inside a scrolling page (the chat) a plain wheel scrolls the page; it zooms
  // once the canvas was clicked, or with ctrl/cmd held (a trackpad pinch sends ctrl).
  let engaged = false;
  wrap.addEventListener('pointerleave', () => {
    engaged = false;
  });
  wrap.addEventListener(
    'wheel',
    (e) => {
      if (showingCode() || !(engaged || e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      touched = true;
      zoomAt(Math.exp(-e.deltaY * 0.0015), ...local(e));
    },
    { passive: false },
  );

  let drag = null;
  wrap.addEventListener('pointerdown', (e) => {
    if (showingCode() || onDock(e)) return;
    touched = engaged = true;
    drag = { px: e.clientX, py: e.clientY, x, y };
    wrap.setPointerCapture(e.pointerId);
    wrap.dataset.drag = '';
  });
  wrap.addEventListener('pointermove', (e) => {
    if (!drag) return;
    x = drag.x + e.clientX - drag.px;
    y = drag.y + e.clientY - drag.py;
    apply();
  });
  const end = () => {
    drag = null;
    delete wrap.dataset.drag;
  };
  wrap.addEventListener('pointerup', end);
  wrap.addEventListener('pointercancel', end);
  wrap.addEventListener('dblclick', (e) => {
    if (!showingCode() && !onDock(e)) zoomAt(1.6, ...local(e));
  });

  host.querySelector('[data-dock]').addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.theme) {
      if (b.dataset.theme === themeName) return;
      themeName = b.dataset.theme;
      save('theme', themeName);
      await draw();
      touched = false;
      fit();
      return;
    }
    const action = b.dataset.a;
    if (action === 'in' || action === 'out') touched = true;
    if (action === 'in') zoomAt(1.3, ...center());
    if (action === 'out') zoomAt(1 / 1.3, ...center());
    if (action === 'fit') {
      touched = false;
      fit();
    }
    if (action === 'tall') {
      const big = wrap.toggleAttribute('data-big');
      b.innerHTML = icon(big ? 'shorter' : 'taller');
      b.title = b.ariaLabel = big ? 'Shorter' : 'Taller';
      fit();
    }
    if (action === 'mode') {
      mode = mode === 'dark' ? 'light' : 'dark';
      save('mode', mode);
      await draw();
      apply();
    }
    if (action === 'copy') {
      await copy(src);
      b.innerHTML = icon('check');
      b.title = b.ariaLabel = 'Copied';
      setTimeout(() => {
        b.innerHTML = icon('copy');
        b.title = b.ariaLabel = 'Copy code';
      }, 1500);
    }
    if (action === 'code') {
      const on = wrap.toggleAttribute('data-src');
      b.innerHTML = icon(on ? 'diagram' : 'code');
      b.title = b.ariaLabel = on ? 'Show diagram' : 'Show code';
    }
  });

  // The host may have no size yet (hidden pane, iframe still sizing): refit on
  // every resize until the user zooms or drags.
  new ResizeObserver(() => {
    if (!touched && wrap.clientWidth > 0) fit();
  }).observe(wrap);
}
