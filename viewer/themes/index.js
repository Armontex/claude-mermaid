// Theme registry. A theme is, per mode, a mermaid config plus the colours of the
// status classes; `swatch` paints its dot in the picker. The first one is the default.
// To add a theme: a file next to this one, and a line here.
import ink from './ink.js';
import live from './live.js';
import print from './print.js';

export const THEMES = { live, ink, print };
export const DEFAULT_THEME = Object.keys(THEMES)[0];
