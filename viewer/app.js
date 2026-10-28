// The viewer as an MCP App: the host hands it the tool call's input over postMessage.
// Protocol: ui/initialize -> ui/notifications/initialized -> ui/notifications/tool-input.
import view from './view.js';

const host = window.parent;

const send = (message) => host.postMessage({ jsonrpc: '2.0', ...message }, '*');
let drawn = false;

// The host's theme is the default canvas; a mode picked in the dock still wins.
// The color scheme must match the host's too: a frame whose scheme differs gets
// an opaque backdrop, white around the canvas's rounded corners.
function follow(context) {
  const theme = context?.theme;
  if (theme !== 'dark' && theme !== 'light') return;
  document.documentElement.dataset.mode = theme;
  document.documentElement.style.colorScheme = theme;
}

window.addEventListener('message', ({ source, data }) => {
  if (source !== host || data?.jsonrpc !== '2.0') return;
  if (data.id === 1 && data.result) {
    follow(data.result.hostContext);
    send({ method: 'ui/notifications/initialized', params: {} });
  } else if (data.method === 'ui/notifications/host-context-changed') {
    follow(data.params);
  } else if (data.method === 'ui/notifications/tool-input' && !drawn) {
    const src = data.params?.arguments?.source;
    if (typeof src !== 'string') return;
    drawn = true;
    // The host frames the app in a rounded card of its own, over a backdrop that
    // is not ours to colour: the canvas fills the frame square, the card rounds it.
    view('cm', src).then(() => document.querySelector('[data-cm]')?.classList.remove('rounded-2xl', 'ring-1'));
  }
});

new ResizeObserver(() => {
  const { width, height } = document.body.getBoundingClientRect();
  send({ method: 'ui/notifications/size-changed', params: { width: Math.ceil(width), height: Math.ceil(height) } });
}).observe(document.body);

send({
  id: 1,
  method: 'ui/initialize',
  params: { protocolVersion: '2025-11-21', appInfo: { name: 'mermaid-canvas', version: '1.0.0' }, appCapabilities: {} },
});
