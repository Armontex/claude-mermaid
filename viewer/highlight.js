// Minimal mermaid highlighting: comments, strings, |edge labels|, arrows, keywords.
const KEYWORDS =
  /^(\s*)(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline|quadrantChart|sankey(?:-beta)?|xychart(?:-beta)?|block(?:-beta)?|packet(?:-beta)?|architecture(?:-beta)?|C4\w*|requirementDiagram|kanban|subgraph|end|classDef|class|style|linkStyle|click|participant|actor|note|loop|alt|else|opt|par|and|rect|section|title|dateFormat|direction|state)\b/;
const TOKEN = /("[^"]*")|(\|[^|]*\|)|(<?[-.=ox]*[-=.]{2,}[>ox]?|-->>|->>|-\)|--\))/g;
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function highlightLine(line) {
  if (/^\s*%%/.test(line)) return `<span class="cm-c">${esc(line)}</span>`;
  let out = '',
    last = 0;
  for (const m of line.matchAll(TOKEN)) {
    out += esc(line.slice(last, m.index));
    const cls = m[1] ? 'cm-s' : m[2] ? 'cm-l' : 'cm-a';
    out += `<span class="${cls}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  out += esc(line.slice(last));
  return out.replace(KEYWORDS, '$1<span class="cm-k">$2</span>');
}
export function highlight(src) {
  return src
    .split('\n')
    .map(
      (line, i) =>
        `<span class="cm-line"><span class="cm-ln">${i + 1}</span><span>${highlightLine(line) || ' '}</span></span>`,
    )
    .join('');
}
