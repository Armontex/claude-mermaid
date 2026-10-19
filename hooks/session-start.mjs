#!/usr/bin/env node
// SessionStart: the one rule the `mermaid` tool's description cannot carry,
// since only the desktop app draws its canvas; a terminal shows a fence better.
if (process.env.CLAUDE_CODE_ENTRYPOINT === 'claude-desktop') {
  console.log(
    'This chat draws diagrams through the mermaid-canvas `mermaid` tool. Whenever a diagram would help, ' +
      'call it with the mermaid source instead of writing a ```mermaid code block: the app shows a code block ' +
      'as plain text.',
  );
}
