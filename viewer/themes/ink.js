// Quiet for documents: white nodes, hairline edges, status as a coloured outline.
import { base } from './base.js';

export default {
  swatch: ['#ffffff', '#2563eb'],
  light: {
    config: {
      ...base({
        primaryColor: '#ffffff',
        primaryBorderColor: '#a1a1aa',
        primaryTextColor: '#27272a',
        lineColor: '#a1a1aa',
        textColor: '#52525b',
        edgeLabelBackground: '#ffffff',
        clusterBkg: '#fafafa',
        clusterBorder: '#e4e4e7',
      }),
      flowchart: { curve: 'basis' },
    },
    statuses: {
      ok: 'fill:#ffffff,stroke:#16a34a,stroke-width:2px,color:#14532d',
      none: 'fill:#ffffff,stroke:#dc2626,stroke-width:2px,color:#7f1d1d',
      blocked: 'fill:#ffffff,stroke:#ea580c,stroke-width:2px,color:#7c2d12',
      ours: 'fill:#ffffff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a',
      warn: 'fill:#ffffff,stroke:#ca8a04,stroke-width:2px,color:#713f12',
    },
  },
  dark: {
    config: {
      ...base({
        darkMode: true,
        primaryColor: '#18181b',
        primaryBorderColor: '#52525b',
        primaryTextColor: '#e4e4e7',
        lineColor: '#71717a',
        textColor: '#a1a1aa',
        edgeLabelBackground: '#18181b',
        clusterBkg: '#1f1f23',
        clusterBorder: '#3f3f46',
      }),
      flowchart: { curve: 'basis' },
    },
    statuses: {
      ok: 'fill:#18181b,stroke:#4ade80,stroke-width:2px,color:#dcfce7',
      none: 'fill:#18181b,stroke:#f87171,stroke-width:2px,color:#fee2e2',
      blocked: 'fill:#18181b,stroke:#fb923c,stroke-width:2px,color:#ffedd5',
      ours: 'fill:#18181b,stroke:#60a5fa,stroke-width:2px,color:#dbeafe',
      warn: 'fill:#18181b,stroke:#facc15,stroke-width:2px,color:#fef9c3',
    },
  },
};
