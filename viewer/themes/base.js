// Shared starting point for themes built on mermaid's `base` theme.
const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const base = (vars) => ({
  theme: 'base',
  look: 'classic',
  themeVariables: { fontFamily: SANS, fontSize: '14px', ...vars },
});
