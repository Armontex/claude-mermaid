// Mermaid 12 gives each diagram type its own theme and look defaults, and those
// beat the top-level ones: repeat the chosen pair for every diagram type.
export function mermaidConfig(defaults, config) {
  const pair = { theme: config.theme, ...(config.look && { look: config.look }) };
  const full = { startOnLoad: false, ...config };
  for (const [key, value] of Object.entries(defaults)) {
    if (value && typeof value === 'object' && ('theme' in value || 'look' in value)) {
      full[key] = { ...config[key], ...pair };
    }
  }
  return full;
}
