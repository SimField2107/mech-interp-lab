# Mech Interp Lab

Interactive visualization tools for mechanistic interpretability research.

## Stack

- Next.js 15 + React 19 + TypeScript
- Three.js + React Three Fiber for 3D visualization
- Tailwind CSS v4
- Zustand for state management

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Instruments

- **Circuit Diagram** — Trace activation paths through transformer layers. Ablate neurons to observe causal effects.
- **Attention Explorer** — Visualize attention patterns between tokens across layers and heads.
- **Logit Lens** — Watch next-token predictions evolve layer by layer.

## Data

Activation traces are synthetic, generated to mirror GPT-2 small topology (12 layers, 12 heads, 768 hidden dim). See `/methodology` for details.
