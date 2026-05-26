import * as fs from "fs";
import * as path from "path";

const LAYERS = 12;
const HEADS_PER_LAYER = 12;
const MLP_NEURONS_PER_LAYER = 80;
const HIDDEN_DIM = 768;

interface Node {
  id: string;
  type: "embed" | "attn" | "mlp" | "unembed";
  layer: number;
  head?: number;
  neuronIdx?: number;
  label: string;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

interface TraceFrame {
  t: number;
  activeNodes: string[];
  activeEdges: string[];
  activations: Record<string, number>;
}

interface AblationResult {
  nodeId: string;
  topK: Array<{ token: string; prob: number }>;
  deltaFromBaseline: number;
}

interface PromptTrace {
  prompt: string;
  tokens: string[];
  prediction: string;
  trace: TraceFrame[];
  baselineTopK: Array<{ token: string; prob: number }>;
  ablations: AblationResult[];
}

const PROMPTS: Array<{ prompt: string; tokens: string[]; prediction: string }> =
  [
    {
      prompt: "Paris is the capital of",
      tokens: ["Paris", "is", "the", "capital", "of"],
      prediction: "France",
    },
    {
      prompt: "The Eiffel Tower is located in",
      tokens: ["The", "Eiffel", "Tower", "is", "located", "in"],
      prediction: "Paris",
    },
    {
      prompt: "Tokyo is a city in",
      tokens: ["Tokyo", "is", "a", "city", "in"],
      prediction: "Japan",
    },
    {
      prompt: "The CEO of Apple is",
      tokens: ["The", "CEO", "of", "Apple", "is"],
      prediction: "Tim",
    },
    {
      prompt: "Water freezes at",
      tokens: ["Water", "freezes", "at"],
      prediction: "zero",
    },
    {
      prompt: "The color of the sky is",
      tokens: ["The", "color", "of", "the", "sky", "is"],
      prediction: "blue",
    },
    {
      prompt: "One plus one equals",
      tokens: ["One", "plus", "one", "equals"],
      prediction: "two",
    },
    {
      prompt: "The largest planet is",
      tokens: ["The", "largest", "planet", "is"],
      prediction: "Jupiter",
    },
    {
      prompt: "Shakespeare wrote",
      tokens: ["Shakespeare", "wrote"],
      prediction: "Hamlet",
    },
    {
      prompt: "The speed of light is",
      tokens: ["The", "speed", "of", "light", "is"],
      prediction: "299",
    },
    {
      prompt: "DNA stands for",
      tokens: ["DNA", "stands", "for"],
      prediction: "deoxy",
    },
    {
      prompt: "The chemical symbol for gold is",
      tokens: ["The", "chemical", "symbol", "for", "gold", "is"],
      prediction: "Au",
    },
    {
      prompt: "Mount Everest is the",
      tokens: ["Mount", "Everest", "is", "the"],
      prediction: "highest",
    },
    {
      prompt: "The year World War II ended was",
      tokens: ["The", "year", "World", "War", "II", "ended", "was"],
      prediction: "1945",
    },
    {
      prompt: "Einstein developed the theory of",
      tokens: ["Einstein", "developed", "the", "theory", "of"],
      prediction: "relativity",
    },
    {
      prompt: "The currency of Japan is",
      tokens: ["The", "currency", "of", "Japan", "is"],
      prediction: "yen",
    },
    {
      prompt: "Photosynthesis occurs in",
      tokens: ["Photosynthesis", "occurs", "in"],
      prediction: "plants",
    },
    {
      prompt: "The human heart has",
      tokens: ["The", "human", "heart", "has"],
      prediction: "four",
    },
    {
      prompt: "Binary code uses",
      tokens: ["Binary", "code", "uses"],
      prediction: "zeros",
    },
    {
      prompt: "Machine learning is a subset of",
      tokens: ["Machine", "learning", "is", "a", "subset", "of"],
      prediction: "artificial",
    },
  ];

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function powerLaw(rand: () => number, alpha = 2): number {
  const u = rand();
  return Math.pow(1 - u, -1 / (alpha - 1)) - 1;
}

function generateArchitecture(): { nodes: Node[] } {
  const nodes: Node[] = [];

  nodes.push({ id: "embed", type: "embed", layer: 0, label: "Embed" });

  for (let l = 1; l <= LAYERS; l++) {
    for (let h = 0; h < HEADS_PER_LAYER; h++) {
      nodes.push({
        id: `L${l.toString().padStart(2, "0")}.H${h.toString().padStart(2, "0")}`,
        type: "attn",
        layer: l,
        head: h,
        label: `L${l}.H${h}`,
      });
    }

    for (let n = 0; n < MLP_NEURONS_PER_LAYER; n++) {
      nodes.push({
        id: `L${l.toString().padStart(2, "0")}.N${n.toString().padStart(3, "0")}`,
        type: "mlp",
        layer: l,
        neuronIdx: n,
        label: `L${l}.N${n}`,
      });
    }
  }

  nodes.push({
    id: "unembed",
    type: "unembed",
    layer: LAYERS + 1,
    label: "Unembed",
  });

  return { nodes };
}

function generateEdges(nodes: Node[]): Edge[] {
  const edges: Edge[] = [];
  const rand = seededRandom(42);

  const nodesByLayer = new Map<number, Node[]>();
  for (const node of nodes) {
    const layer = node.layer;
    if (!nodesByLayer.has(layer)) nodesByLayer.set(layer, []);
    nodesByLayer.get(layer)!.push(node);
  }

  for (let l = 0; l <= LAYERS; l++) {
    const sourceNodes = nodesByLayer.get(l) || [];
    const targetNodes = nodesByLayer.get(l + 1) || [];

    for (const source of sourceNodes) {
      const targetCount = Math.min(
        Math.floor(rand() * 8) + 3,
        targetNodes.length
      );
      const shuffled = [...targetNodes].sort(() => rand() - 0.5);
      const targets = shuffled.slice(0, targetCount);

      for (const target of targets) {
        const magnitude = powerLaw(rand, 2.5) * 0.3;
        const sign = rand() > 0.3 ? 1 : -1;
        const weight = magnitude * sign;

        edges.push({
          id: `${source.id}->${target.id}`,
          source: source.id,
          target: target.id,
          weight: Math.max(-1, Math.min(1, weight)),
        });
      }
    }
  }

  return edges;
}

function generatePromptTrace(
  promptData: (typeof PROMPTS)[0],
  nodes: Node[],
  edges: Edge[]
): PromptTrace {
  const seed = promptData.prompt.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRandom(seed);

  const attnNodes = nodes.filter((n) => n.type === "attn");
  const mlpNodes = nodes.filter((n) => n.type === "mlp");

  const causalPath: string[] = ["embed"];
  const usedHeads = new Set<string>();

  for (let l = 1; l <= LAYERS; l++) {
    const layerAttn = attnNodes.filter((n) => n.layer === l);
    const layerMlp = mlpNodes.filter((n) => n.layer === l);

    const numActiveHeads = Math.floor(rand() * 3) + 2;
    const activeHeads = layerAttn
      .sort(() => rand() - 0.5)
      .slice(0, numActiveHeads);
    activeHeads.forEach((h) => {
      causalPath.push(h.id);
      usedHeads.add(h.id);
    });

    const numActiveNeurons = Math.floor(rand() * 5) + 3;
    const activeNeurons = layerMlp
      .sort(() => rand() - 0.5)
      .slice(0, numActiveNeurons);
    activeNeurons.forEach((n) => causalPath.push(n.id));
  }

  causalPath.push("unembed");

  const causalSet = new Set(causalPath);
  const activeEdges = edges
    .filter((e) => causalSet.has(e.source) && causalSet.has(e.target))
    .map((e) => e.id);

  const numFrames = 24;
  const trace: TraceFrame[] = [];

  for (let i = 0; i < numFrames; i++) {
    const t = i / (numFrames - 1);
    const progressIdx = Math.floor(t * causalPath.length);

    const activeNodes = causalPath.slice(0, progressIdx + 1);
    const frameEdges = activeEdges.filter((eId) => {
      const edge = edges.find((e) => e.id === eId);
      if (!edge) return false;
      return activeNodes.includes(edge.source) && activeNodes.includes(edge.target);
    });

    const activations: Record<string, number> = {};
    for (const nodeId of activeNodes) {
      activations[nodeId] = 0.3 + rand() * 0.7;
    }

    trace.push({
      t,
      activeNodes,
      activeEdges: frameEdges,
      activations,
    });
  }

  const baselineTopK = [
    { token: promptData.prediction, prob: 0.72 + rand() * 0.15 },
    { token: generateAltToken(rand), prob: 0.08 + rand() * 0.05 },
    { token: generateAltToken(rand), prob: 0.04 + rand() * 0.03 },
    { token: generateAltToken(rand), prob: 0.02 + rand() * 0.02 },
    { token: generateAltToken(rand), prob: 0.01 + rand() * 0.01 },
  ];

  const ablations: AblationResult[] = [];
  const importantHeads = Array.from(usedHeads).slice(0, 8);

  for (const headId of importantHeads) {
    const delta = -(rand() * 0.4 + 0.1);
    const newProb = Math.max(0.05, baselineTopK[0].prob + delta);

    ablations.push({
      nodeId: headId,
      topK: [
        { token: promptData.prediction, prob: newProb },
        { token: generateAltToken(rand), prob: 0.15 + rand() * 0.1 },
        { token: generateAltToken(rand), prob: 0.08 + rand() * 0.05 },
        { token: generateAltToken(rand), prob: 0.04 + rand() * 0.03 },
        { token: generateAltToken(rand), prob: 0.02 + rand() * 0.02 },
      ],
      deltaFromBaseline: delta,
    });
  }

  return {
    prompt: promptData.prompt,
    tokens: promptData.tokens,
    prediction: promptData.prediction,
    trace,
    baselineTopK,
    ablations,
  };
}

function generateAltToken(rand: () => number): string {
  const tokens = [
    "the",
    "a",
    "an",
    "is",
    "was",
    "and",
    "of",
    "to",
    "in",
    "that",
    "it",
    "for",
    "as",
    "with",
    "his",
    "they",
    "be",
    "at",
    "one",
    "have",
  ];
  return tokens[Math.floor(rand() * tokens.length)];
}

function promptToSlug(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function main() {
  const outDir = path.join(process.cwd(), "public", "data");
  const promptsDir = path.join(outDir, "prompts");

  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(promptsDir, { recursive: true });

  console.log("Generating architecture...");
  const { nodes } = generateArchitecture();
  const architecture = {
    layers: LAYERS,
    headsPerLayer: HEADS_PER_LAYER,
    hiddenDim: HIDDEN_DIM,
    mlpNeuronsPerLayer: MLP_NEURONS_PER_LAYER,
    nodes,
  };
  fs.writeFileSync(
    path.join(outDir, "architecture.json"),
    JSON.stringify(architecture, null, 2)
  );
  console.log(`  → ${nodes.length} nodes`);

  console.log("Generating edges...");
  const edges = generateEdges(nodes);
  fs.writeFileSync(path.join(outDir, "edges.json"), JSON.stringify(edges, null, 2));
  console.log(`  → ${edges.length} edges`);

  console.log("Generating prompt traces...");
  for (const promptData of PROMPTS) {
    const trace = generatePromptTrace(promptData, nodes, edges);
    const slug = promptToSlug(promptData.prompt);
    fs.writeFileSync(
      path.join(promptsDir, `${slug}.json`),
      JSON.stringify(trace, null, 2)
    );
    console.log(`  → ${slug}.json`);
  }

  console.log("Done!");
}

main();
