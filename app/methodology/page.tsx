import Link from "next/link";

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-surface-0">
      <header className="h-12 bg-surface-1 hairline-b flex items-center px-6">
        <Link
          href="/"
          className="font-mono text-xs text-signal tracking-wider uppercase hover:opacity-80 transition-opacity"
        >
          MIL
        </Link>
        <span className="font-mono text-[10px] text-fg-2 ml-2">v0.1</span>
        <span className="mx-4 text-fg-2">/</span>
        <span className="font-mono text-[10px] text-fg-2 uppercase tracking-wider">
          Methodology
        </span>
      </header>

      <main className="py-16 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="font-mono text-2xl text-fg-0 mb-8">Methodology</h1>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-mono text-xs text-signal uppercase tracking-wider mb-4">
                Data Disclosure
              </h2>
              <p className="text-fg-1 text-sm leading-relaxed">
                The activation traces and circuit visualizations in this tool
                are <strong className="text-fg-0">synthetic</strong>. They are
                procedurally generated to mirror the topology and statistical
                properties of real transformer models—specifically GPT-2 small
                (12 layers, 12 attention heads, 768 hidden dimensions).
              </p>
              <p className="text-fg-1 text-sm leading-relaxed mt-4">
                This means the visualizations demonstrate the{" "}
                <em>structure</em> and <em>interaction patterns</em> of
                mechanistic interpretability analysis, but do not reflect actual
                model activations from inference.
              </p>
            </section>

            <section>
              <h2 className="font-mono text-xs text-signal uppercase tracking-wider mb-4">
                Why Synthetic Data?
              </h2>
              <div className="bg-surface-1 border border-rule-strong rounded-sm p-4 text-sm">
                <ul className="space-y-3 text-fg-2">
                  <li className="flex gap-3">
                    <span className="text-signal shrink-0">01</span>
                    <span>
                      Running real mechanistic interpretability analyses
                      requires significant compute (GPU inference) and model
                      weights (~500MB for GPT-2 small).
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-signal shrink-0">02</span>
                    <span>
                      This demo focuses on the visualization and interaction
                      patterns rather than live model inference.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-signal shrink-0">03</span>
                    <span>
                      Synthetic data allows for a fully static deployment with
                      no backend infrastructure.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-mono text-xs text-signal uppercase tracking-wider mb-4">
                What&apos;s Real
              </h2>
              <div className="grid gap-3">
                {[
                  {
                    label: "Architecture",
                    desc: "The layer/head/neuron structure matches GPT-2 small exactly.",
                  },
                  {
                    label: "Topology",
                    desc: "Edge connectivity follows realistic attention and MLP patterns.",
                  },
                  {
                    label: "Statistics",
                    desc: "Weight distributions use heavy-tailed (power law) priors that match observed transformer weights.",
                  },
                  {
                    label: "Techniques",
                    desc: "Activation patching, logit lens, and attention visualization are real interpretability methods.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex gap-4 p-3 bg-surface-1 rounded-sm"
                  >
                    <span className="font-mono text-[10px] text-signal uppercase tracking-wider shrink-0 w-24">
                      {item.label}
                    </span>
                    <span className="text-fg-2 text-sm">{item.desc}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-mono text-xs text-signal uppercase tracking-wider mb-4">
                The Instruments
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-mono text-sm text-fg-0 mb-2">
                    Circuit Diagram
                  </h3>
                  <p className="text-fg-2 text-sm leading-relaxed">
                    Visualizes the flow of information through transformer
                    layers as a 3D graph. Nodes represent attention heads and
                    MLP neurons; edges represent weight connections. The
                    ablation (patching) feature demonstrates causal analysis:
                    toggling a node &quot;off&quot; shows how downstream
                    predictions change.
                  </p>
                </div>
                <div>
                  <h3 className="font-mono text-sm text-fg-0 mb-2">
                    Attention Explorer
                  </h3>
                  <p className="text-fg-2 text-sm leading-relaxed">
                    Shows attention patterns between input tokens for a selected
                    layer and head. The heatmap view displays the full
                    source-target attention matrix; the beam view renders
                    high-weight connections as curved tubes in 3D space.
                  </p>
                </div>
                <div>
                  <h3 className="font-mono text-sm text-fg-0 mb-2">
                    Logit Lens
                  </h3>
                  <p className="text-fg-2 text-sm leading-relaxed">
                    Applies the unembedding matrix at each intermediate layer to
                    see what the model would predict if forced to output at that
                    point. Demonstrates how predictions evolve from diffuse
                    (early layers) to confident (late layers), with a
                    &quot;commit point&quot; where the target token first
                    dominates.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-mono text-xs text-signal uppercase tracking-wider mb-4">
                References
              </h2>
              <ul className="space-y-2">
                {[
                  {
                    title: "A Mathematical Framework for Transformer Circuits",
                    url: "https://transformer-circuits.pub/2021/framework/index.html",
                    source: "Anthropic",
                  },
                  {
                    title: "In-context Learning and Induction Heads",
                    url: "https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html",
                    source: "Anthropic",
                  },
                  {
                    title: "TransformerLens",
                    url: "https://github.com/neelnanda-io/TransformerLens",
                    source: "Neel Nanda",
                  },
                  {
                    title: "Mechanistic Interpretability Quickstart",
                    url: "https://www.neelnanda.io/mechanistic-interpretability/quickstart",
                    source: "Neel Nanda",
                  },
                ].map((ref) => (
                  <li key={ref.url}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-baseline gap-2 text-sm"
                    >
                      <span className="text-fg-1 group-hover:text-signal transition-colors">
                        {ref.title}
                      </span>
                      <span className="text-fg-2 text-[10px]">
                        — {ref.source}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-rule">
            <Link
              href="/"
              className="font-mono text-[10px] text-fg-2 hover:text-signal uppercase tracking-wider transition-colors"
            >
              ← Back to Lab
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
