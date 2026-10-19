// Status classes: diagrams write `:::ok` and leave the colours to the theme, so
// switching themes repaints the statuses too.
export const STATUSES = ['ok', 'none', 'blocked', 'ours', 'warn'];

// Diagram types that take classDef. For them the theme's status classes replace
// any classDef of the same name in the source; other class names are left alone.
const CLASSED = /^\s*(flowchart|graph|stateDiagram(-v2)?)\b/m;
const STATUS_DEF = new RegExp(`^\\s*classDef\\s+(${STATUSES.join('|')})\\b.*$`, 'gm');
export function withStatuses(src, statuses) {
  const head = src.split('\n').find((l) => l.trim() && !/^\s*(%%|---)/.test(l)) ?? '';
  if (!CLASSED.test(head)) return src;
  const defs = Object.entries(statuses).map(([name, style]) => `classDef ${name} ${style}`);
  return [src.replace(STATUS_DEF, ''), ...defs].join('\n');
}
