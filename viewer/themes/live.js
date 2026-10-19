// The mermaid.live look: orthogonal edges, grey edge labels, pastel statuses.
export default {
  swatch: ['#ffe3e3', '#d3f9d8'],
  light: {
    config: { theme: 'redux-color' },
    statuses: {
      ok: 'fill:#d3f9d8,stroke:#2f9e44,color:#173404',
      none: 'fill:#ffe3e3,stroke:#e03131,color:#501313',
      blocked: 'fill:#fff4e6,stroke:#e8590c,color:#412402',
      ours: 'fill:#e7f5ff,stroke:#1971c2,color:#042c53',
      warn: 'fill:#fff9db,stroke:#f08c00,color:#5c3c00',
    },
  },
  dark: {
    config: { theme: 'redux-dark-color' },
    statuses: {
      ok: 'fill:#16301d,stroke:#51cf66,color:#d3f9d8',
      none: 'fill:#3a1717,stroke:#ff6b6b,color:#ffe3e3',
      blocked: 'fill:#3a2412,stroke:#ff922b,color:#fff4e6',
      ours: 'fill:#132c44,stroke:#4dabf7,color:#e7f5ff',
      warn: 'fill:#3a3010,stroke:#fcc419,color:#fff9db',
    },
  },
};
