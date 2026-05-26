import Link from "next/link";

const instruments = [
  {
    id: "circuit",
    name: "Circuit Diagram",
    description:
      "Trace activation paths through the model. Toggle neurons to observe causal effects on predictions.",
    status: "active",
    path: "/instruments/circuit",
    stats: "1106 nodes · 6616 edges",
  },
  {
    id: "attention",
    name: "Attention Explorer",
    description:
      "Visualize attention patterns between tokens. Switch between heatmap and 3D beam views.",
    status: "active",
    path: "/instruments/attention",
    stats: "12 layers · 12 heads",
  },
  {
    id: "logit-lens",
    name: "Logit Lens",
    description:
      "Watch predictions evolve layer by layer. Identify when the model commits to its answer.",
    status: "active",
    path: "/instruments/logit-lens",
    stats: "12 layers · top-5 predictions",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <header className="h-12 bg-surface-1 hairline-b flex items-center px-6">
        <span className="font-mono text-xs text-signal tracking-wider uppercase">
          Mech Interp Lab
        </span>
        <span className="font-mono text-[10px] text-fg-2 ml-2">v0.1</span>
        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/methodology"
            className="font-mono text-[10px] text-fg-2 hover:text-signal uppercase tracking-wider transition-colors"
          >
            Methodology
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="py-20 px-6 border-b border-rule">
          <div className="max-w-4xl mx-auto">
            <div className="bg-surface-1 rounded-sm border border-rule-strong p-6 font-mono text-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-rule">
                <div className="w-3 h-3 rounded-full bg-critical/80" />
                <div className="w-3 h-3 rounded-full bg-intervention/80" />
                <div className="w-3 h-3 rounded-full bg-signal/80" />
                <span className="ml-2 text-[10px] text-fg-2">terminal</span>
              </div>

              <div className="space-y-2 text-fg-1">
                <p>
                  <span className="text-signal">$</span> init mech-interp-lab
                  --model gpt2-small
                </p>
                <p className="text-fg-2">
                  Loading architecture: 12 layers, 12 heads, 768 hidden dim
                </p>
                <p className="text-fg-2">Generating activation traces...</p>
                <p className="text-fg-2">Building edge graph (6616 edges)...</p>
                <p>
                  <span className="text-signal">✓</span> Ready. 3 instruments
                  available.
                </p>
                <p className="mt-4">
                  <span className="text-signal">$</span>{" "}
                  <span className="animate-pulse">_</span>
                </p>
              </div>
            </div>

            <div className="mt-12 max-w-2xl">
              <h1 className="text-3xl font-medium text-fg-0 mb-4">
                Mechanistic Interpretability Lab
              </h1>
              <p className="text-fg-1 leading-relaxed">
                Interactive visualization tools for understanding how
                transformer models process information. Explore the internal
                circuits, attention patterns, and layer-by-layer predictions of
                language models.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 flex-1">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <span className="font-mono text-[10px] text-fg-2 tracking-wider uppercase">
                Instruments
              </span>
              <div className="flex-1 h-px bg-rule" />
            </div>

            <div className="grid gap-4">
              {instruments.map((inst, i) => (
                <Link
                  key={inst.id}
                  href={inst.path}
                  className="group block bg-surface-1 border border-rule-strong hover:border-signal/40 rounded-sm transition-all"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-5">
                      <div className="w-10 h-10 bg-surface-2 rounded-sm flex items-center justify-center shrink-0">
                        <span className="font-mono text-lg text-fg-2 group-hover:text-signal transition-colors">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="font-mono text-base text-fg-0 group-hover:text-signal transition-colors">
                            {inst.name}
                          </h2>
                          <span className="font-mono text-[10px] text-signal/70 uppercase tracking-wider">
                            {inst.status}
                          </span>
                        </div>
                        <p className="text-fg-2 text-sm leading-relaxed mb-3">
                          {inst.description}
                        </p>
                        <div className="font-mono text-[10px] text-fg-2">
                          {inst.stats}
                        </div>
                      </div>

                      <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                        <span className="font-mono text-fg-2 group-hover:text-signal transition-colors">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface-1 hairline-t py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="font-mono text-[10px] text-fg-2">
            GPT-2 Small Architecture · 12L × 12H × 768D
          </div>
          <Link
            href="/methodology"
            className="font-mono text-[10px] text-fg-2 hover:text-signal transition-colors"
          >
            How this works →
          </Link>
        </div>
      </footer>
    </div>
  );
}
