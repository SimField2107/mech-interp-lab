"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Panel } from "@/components/chrome";
import { PlaybackController } from "@/components/circuit";
import { LogitReadout } from "@/components/circuit/LogitReadout";
import { HeatMap } from "@/components/attention";
import { Cascade } from "@/components/logit-lens";
import {
  Architecture,
  Edge,
  TraceFrame,
  PromptTrace,
  loadArchitecture,
  loadEdges,
  loadPromptTrace,
} from "@/lib/data";
import { generateAttentionPattern, getTopAttentionPairs } from "@/lib/attention";
import { generateLogitLensData } from "@/lib/logit-lens";

const CircuitScene = dynamic(
  () => import("@/components/circuit/CircuitScene").then((m) => m.CircuitScene),
  { ssr: false }
);

const BeamScene = dynamic(
  () => import("@/components/attention/BeamScene").then((m) => m.BeamScene),
  { ssr: false }
);

const NAV_ITEMS = [
  { id: "hero", label: "Intro" },
  { id: "circuit", label: "Circuit" },
  { id: "attention", label: "Attention" },
  { id: "logit-lens", label: "Logit Lens" },
];

export default function Home() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-surface-0">
      <nav className="fixed top-0 left-0 right-0 z-50 h-12 bg-surface-1/95 backdrop-blur hairline-b flex items-center px-6">
        <span className="font-mono text-xs text-signal tracking-wider uppercase">
          Mech Interp Lab
        </span>
        <span className="font-mono text-[10px] text-fg-2 ml-2">v0.1</span>

        <div className="ml-8 flex items-center gap-1">
          {NAV_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-sm transition-colors ${
                activeSection === id
                  ? "bg-signal/20 text-signal"
                  : "text-fg-2 hover:text-fg-1"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Link
          href="/methodology"
          className="ml-auto font-mono text-[10px] text-fg-2 hover:text-signal uppercase tracking-wider transition-colors"
        >
          Methodology
        </Link>
      </nav>

      <section id="hero" className="min-h-screen pt-12 flex items-center">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="bg-surface-1 rounded-sm border border-rule-strong p-6 font-mono text-sm mb-12">
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
                <span className="text-signal">✓</span> Ready. Scroll to explore.
              </p>
            </div>
          </div>

          <h1 className="text-4xl font-medium text-fg-0 mb-6">
            Mechanistic Interpretability Lab
          </h1>
          <p className="text-fg-1 text-lg leading-relaxed max-w-2xl mb-6">
            Interactive visualization tools for understanding how transformer
            models process information internally.
          </p>
          <p className="text-fg-2 leading-relaxed max-w-2xl mb-8">
            Mechanistic interpretability treats neural networks like reverse-engineering 
            a complex circuit. Instead of treating models as black boxes, we map their 
            internal components—attention heads, neurons, weight matrices—to understand 
            <em className="text-fg-1"> how</em> they compute answers, not just <em className="text-fg-1">what</em> they output. 
            This lab visualizes three core techniques: circuit tracing, attention pattern 
            analysis, and the logit lens.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            <div className="bg-surface-1 border border-rule-strong rounded-sm p-4">
              <div className="font-mono text-signal text-xs mb-2">01 Circuit</div>
              <p className="text-fg-2 text-sm">Trace activation paths and ablate nodes to find causal circuits</p>
            </div>
            <div className="bg-surface-1 border border-rule-strong rounded-sm p-4">
              <div className="font-mono text-signal text-xs mb-2">02 Attention</div>
              <p className="text-fg-2 text-sm">Visualize how tokens attend to each other across layers</p>
            </div>
            <div className="bg-surface-1 border border-rule-strong rounded-sm p-4">
              <div className="font-mono text-signal text-xs mb-2">03 Logit Lens</div>
              <p className="text-fg-2 text-sm">Watch predictions evolve from early to final layers</p>
            </div>
          </div>

          <button
            onClick={() => scrollTo("circuit")}
            className="inline-flex items-center gap-2 font-mono text-sm text-signal hover:opacity-80 transition-opacity"
          >
            <span>Start exploring</span>
            <span className="text-lg">↓</span>
          </button>
        </div>
      </section>

      <CircuitSection />
      <AttentionSection />
      <LogitLensSection />

      <footer className="bg-surface-1 hairline-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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

function CircuitSection() {
  const { prompt, setPrompt, ablatedNodes, toggleAblation, ablateMode, toggleAblateMode, resetAblations } =
    useStore();
  const [architecture, setArchitecture] = useState<Architecture | null>(null);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [promptTrace, setPromptTrace] = useState<PromptTrace | null>(null);
  const [currentFrame, setCurrentFrame] = useState<TraceFrame | null>(null);

  useEffect(() => {
    Promise.all([loadArchitecture(), loadEdges()]).then(([arch, edg]) => {
      setArchitecture(arch);
      setEdges(edg);
    });
  }, []);

  useEffect(() => {
    loadPromptTrace(prompt).then((trace) => {
      setPromptTrace(trace);
      if (trace?.trace.length) setCurrentFrame(trace.trace[0]);
    });
  }, [prompt]);

  const handleFrameChange = useCallback((frame: TraceFrame) => {
    setCurrentFrame(frame);
  }, []);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (ablateMode) toggleAblation(nodeId);
    },
    [ablateMode, toggleAblation]
  );

  return (
    <section id="circuit" className="min-h-screen py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          number="01"
          title="Circuit Diagram"
          subtitle="Mapping the neural pathways of language understanding"
          description="Modern transformers process information through a series of layers, each containing attention heads and MLP neurons. This visualization maps these components as a 3D graph, showing how information flows from input to output. When you type a prompt, watch the activation trace light up—these are the specific neurons that fire to produce the prediction."
          concepts={[
            { term: "Nodes", definition: "Attention heads (rings) and MLP neurons (grid) at each layer" },
            { term: "Edges", definition: "Weighted connections showing information flow between layers" },
            { term: "Ablation", definition: "Disabling a node to test if it's causally important for the output" },
          ]}
        />

        <div className="bg-surface-1 rounded-sm border border-rule-strong overflow-hidden">
          <div className="p-4 hairline-b flex items-center gap-4 flex-wrap">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter prompt..."
              className="flex-1 min-w-[200px] h-8 px-3 text-xs"
            />
            <button
              onClick={toggleAblateMode}
              className={`font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-sm transition-colors ${
                ablateMode
                  ? "bg-intervention text-surface-0"
                  : "bg-surface-2 text-fg-1 hover:text-fg-0"
              }`}
            >
              {ablateMode ? "Ablate: On" : "Ablate: Off"}
            </button>
            <button
              onClick={resetAblations}
              className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-sm bg-surface-2 text-fg-1 hover:text-fg-0 transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="relative h-[500px]">
            {architecture ? (
              <CircuitScene
                architecture={architecture}
                edges={edges}
                currentFrame={currentFrame}
                ablatedNodes={ablatedNodes}
                onNodeClick={handleNodeClick}
              />
            ) : (
              <LoadingState />
            )}

            <div className="absolute top-4 left-4 w-64">
              <LogitReadout promptTrace={promptTrace} ablatedNodes={ablatedNodes} />
            </div>

            {ablateMode && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="bg-intervention/90 text-surface-0 px-4 py-2 rounded-sm font-mono text-xs uppercase tracking-wider">
                  Click nodes to ablate
                </div>
              </div>
            )}
          </div>

          <div className="p-4 hairline-t">
            {promptTrace ? (
              <PlaybackController
                trace={promptTrace.trace}
                onFrameChange={handleFrameChange}
              />
            ) : (
              <div className="h-14 flex items-center justify-center">
                <span className="font-mono text-[10px] text-fg-2">
                  Loading trace...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AttentionSection() {
  const { prompt } = useStore();
  const [layer, setLayer] = useState(6);
  const [head, setHead] = useState(0);
  const [view, setView] = useState<"heatmap" | "beams">("heatmap");
  const [promptTrace, setPromptTrace] = useState<PromptTrace | null>(null);

  useEffect(() => {
    loadPromptTrace(prompt).then(setPromptTrace);
  }, [prompt]);

  const tokens = promptTrace?.tokens || prompt.split(/\s+/).filter(Boolean);
  const pattern = generateAttentionPattern(tokens, layer, head);
  const topPairs = getTopAttentionPairs(pattern, 5);

  return (
    <section id="attention" className="min-h-screen py-20 px-6 bg-surface-1/30">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          number="02"
          title="Attention Explorer"
          subtitle="How tokens 'look at' each other during processing"
          description="Attention is the core mechanism that lets transformers understand context. Each attention head learns different patterns—some track syntax, others semantics, some copy information forward. The heatmap shows attention weights: brighter cells mean token A is paying more attention to token B. The beam view renders these same weights as curved connections in 3D space."
          concepts={[
            { term: "Layer", definition: "Deeper layers capture more abstract patterns" },
            { term: "Head", definition: "Each head specializes in different linguistic features" },
            { term: "Attention Weight", definition: "How much one token position 'attends to' another" },
          ]}
        />

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <div className="space-y-4">
            <Panel title="Layer">
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 12 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setLayer(i + 1)}
                    className={`font-mono text-[10px] py-1.5 rounded-sm transition-colors ${
                      layer === i + 1
                        ? "bg-signal text-surface-0"
                        : "bg-surface-2 text-fg-1 hover:bg-surface-3"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Head">
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 12 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setHead(i)}
                    className={`font-mono text-[10px] py-1.5 rounded-sm transition-colors ${
                      head === i
                        ? "bg-signal text-surface-0"
                        : "bg-surface-2 text-fg-1 hover:bg-surface-3"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="View">
              <div className="flex gap-1">
                {(["heatmap", "beams"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`flex-1 font-mono text-[10px] py-1.5 rounded-sm capitalize transition-colors ${
                      view === v
                        ? "bg-signal text-surface-0"
                        : "bg-surface-2 text-fg-1 hover:bg-surface-3"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Top Attention">
              <div className="space-y-1.5">
                {topPairs.map((pair, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 font-mono text-[10px]"
                  >
                    <span className="text-fg-2 w-4">{i + 1}.</span>
                    <span className="text-fg-1 truncate flex-1">
                      {tokens[pair.source]?.slice(0, 6)}
                    </span>
                    <span className="text-fg-2">→</span>
                    <span className="text-fg-1 truncate flex-1">
                      {tokens[pair.target]?.slice(0, 6)}
                    </span>
                    <span className="text-signal tabular-nums">
                      {(pair.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="bg-surface-1 rounded-sm border border-rule-strong overflow-hidden">
            <div className="p-3 hairline-b flex items-center justify-between">
              <span className="font-mono text-[10px] text-fg-2">
                L{layer.toString().padStart(2, "0")}.H{head.toString().padStart(2, "0")}
              </span>
              <span className="font-mono text-[10px] text-fg-2">
                {tokens.length} tokens
              </span>
            </div>
            <div className="h-[450px] flex items-center justify-center p-4">
              {view === "heatmap" ? (
                <HeatMap pattern={pattern} width={420} height={420} />
              ) : (
                <div className="w-full h-full">
                  <BeamScene pattern={pattern} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogitLensSection() {
  const { prompt } = useStore();
  const [promptTrace, setPromptTrace] = useState<PromptTrace | null>(null);

  useEffect(() => {
    loadPromptTrace(prompt).then(setPromptTrace);
  }, [prompt]);

  const tokens = promptTrace?.tokens || prompt.split(/\s+/).filter(Boolean);
  const prediction = promptTrace?.prediction || "unknown";
  const data = generateLogitLensData(prompt, tokens, prediction);

  return (
    <section id="logit-lens" className="min-h-screen py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          number="03"
          title="Logit Lens"
          subtitle="Watching the model 'make up its mind' layer by layer"
          description="The logit lens technique applies the final unembedding matrix at each intermediate layer, letting us peek at what the model would predict if forced to output at that point. Early layers show diffuse, uncertain predictions. As we go deeper, the model converges toward its final answer. The 'commit point' is where the correct token first becomes the top prediction—revealing how many layers the model needs to 'solve' this particular prompt."
          concepts={[
            { term: "Unembedding", definition: "Converting hidden states back to vocabulary probabilities" },
            { term: "Commit Point", definition: "The layer where the model first confidently predicts the answer" },
            { term: "Top-K", definition: "The highest-probability next tokens at each layer" },
          ]}
        />

        <div className="bg-surface-1 rounded-sm border border-rule-strong p-6">
          <div className="mb-6 pb-4 hairline-b">
            <div className="font-mono text-xs text-fg-0">
              &quot;{prompt}&quot;
            </div>
            {promptTrace && (
              <div className="font-mono text-[10px] text-signal mt-1">
                → {promptTrace.prediction}
              </div>
            )}
          </div>

          <Cascade data={data} />
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  number,
  title,
  subtitle,
  description,
  concepts,
}: {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  concepts?: Array<{ term: string; definition: string }>;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-start gap-6 mb-6">
        <div className="w-12 h-12 bg-surface-2 rounded-sm flex items-center justify-center shrink-0">
          <span className="font-mono text-lg text-fg-2">{number}</span>
        </div>
        <div>
          <h2 className="font-mono text-2xl text-fg-0 mb-1">{title}</h2>
          <p className="text-signal text-sm">{subtitle}</p>
        </div>
      </div>
      
      <div className="pl-[72px]">
        <p className="text-fg-1 leading-relaxed max-w-2xl mb-4">{description}</p>
        
        {concepts && concepts.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4">
            {concepts.map((c) => (
              <div key={c.term} className="bg-surface-1 border border-rule-strong rounded-sm px-3 py-2">
                <span className="font-mono text-[10px] text-signal uppercase tracking-wider">{c.term}</span>
                <p className="text-fg-2 text-xs mt-1">{c.definition}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="font-mono text-signal text-xs mb-2 animate-pulse">
          Initializing
        </div>
        <div className="font-mono text-fg-2 text-[10px]">
          Loading model architecture...
        </div>
      </div>
    </div>
  );
}
