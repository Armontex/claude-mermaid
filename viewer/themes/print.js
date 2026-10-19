// Black and white: status is the line pattern, so it survives print and colour blindness.
import { base } from './base.js';

export default {
  swatch: ['#ffffff', '#000000'],
  light: {
    config: base({
      primaryColor: '#ffffff',
      primaryBorderColor: '#000000',
      primaryTextColor: '#000000',
      lineColor: '#000000',
      textColor: '#000000',
      edgeLabelBackground: '#ffffff',
      clusterBkg: '#ffffff',
      clusterBorder: '#000000',
    }),
    statuses: {
      ok: 'fill:#ffffff,stroke:#000000,stroke-width:2px,color:#000000',
      none: 'fill:#ffffff,stroke:#000000,stroke-width:1.5px,stroke-dasharray:6 4,color:#000000',
      blocked: 'fill:#e4e4e7,stroke:#000000,stroke-width:1.5px,stroke-dasharray:2 3,color:#000000',
      ours: 'fill:#ffffff,stroke:#000000,stroke-width:3.5px,color:#000000',
      warn: 'fill:#ffffff,stroke:#000000,stroke-width:1.5px,stroke-dasharray:9 3 2 3,color:#000000',
    },
  },
  dark: {
    config: base({
      darkMode: true,
      primaryColor: '#000000',
      primaryBorderColor: '#ffffff',
      primaryTextColor: '#ffffff',
      lineColor: '#ffffff',
      textColor: '#ffffff',
      edgeLabelBackground: '#000000',
      clusterBkg: '#000000',
      clusterBorder: '#ffffff',
    }),
    statuses: {
      ok: 'fill:#000000,stroke:#ffffff,stroke-width:2px,color:#ffffff',
      none: 'fill:#000000,stroke:#ffffff,stroke-width:1.5px,stroke-dasharray:6 4,color:#ffffff',
      blocked: 'fill:#3f3f46,stroke:#ffffff,stroke-width:1.5px,stroke-dasharray:2 3,color:#ffffff',
      ours: 'fill:#000000,stroke:#ffffff,stroke-width:3.5px,color:#ffffff',
      warn: 'fill:#000000,stroke:#ffffff,stroke-width:1.5px,stroke-dasharray:9 3 2 3,color:#ffffff',
    },
  },
};
