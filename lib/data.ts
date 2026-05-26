export interface Architecture {
  layers: number;
  headsPerLayer: number;
  hiddenDim: number;
  mlpNeuronsPerLayer: number;
  nodes: Node[];
}

export interface Node {
  id: string;
  type: "embed" | "attn" | "mlp" | "unembed";
  layer: number;
  head?: number;
  neuronIdx?: number;
  label: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface TraceFrame {
  t: number;
  activeNodes: string[];
  activeEdges: string[];
  activations: Record<string, number>;
}

export interface AblationResult {
  nodeId: string;
  topK: Array<{ token: string; prob: number }>;
  deltaFromBaseline: number;
}

export interface PromptTrace {
  prompt: string;
  tokens: string[];
  prediction: string;
  trace: TraceFrame[];
  baselineTopK: Array<{ token: string; prob: number }>;
  ablations: AblationResult[];
}

let architectureCache: Architecture | null = null;
let edgesCache: Edge[] | null = null;
const promptCache = new Map<string, PromptTrace>();

export async function loadArchitecture(): Promise<Architecture> {
  if (architectureCache) return architectureCache;
  const res = await fetch("/data/architecture.json");
  architectureCache = await res.json();
  return architectureCache!;
}

export async function loadEdges(): Promise<Edge[]> {
  if (edgesCache) return edgesCache;
  const res = await fetch("/data/edges.json");
  edgesCache = await res.json();
  return edgesCache!;
}

export async function loadPromptTrace(prompt: string): Promise<PromptTrace | null> {
  const slug = promptToSlug(prompt);
  if (promptCache.has(slug)) return promptCache.get(slug)!;

  try {
    const res = await fetch(`/data/prompts/${slug}.json`);
    if (!res.ok) return null;
    const trace = await res.json();
    promptCache.set(slug, trace);
    return trace;
  } catch {
    return null;
  }
}

export function promptToSlug(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export function getNodePosition(
  node: Node,
  arch: Architecture
): { x: number; y: number; z: number } {
  const layerSpacing = 3;
  const z = node.layer * layerSpacing;

  if (node.type === "embed" || node.type === "unembed") {
    return { x: 0, y: 0, z };
  }

  if (node.type === "attn" && node.head !== undefined) {
    const angle = (node.head / arch.headsPerLayer) * Math.PI * 2;
    const radius = 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z,
    };
  }

  if (node.type === "mlp" && node.neuronIdx !== undefined) {
    const cols = Math.ceil(Math.sqrt(arch.mlpNeuronsPerLayer));
    const row = Math.floor(node.neuronIdx / cols);
    const col = node.neuronIdx % cols;
    const gridSize = 4;
    return {
      x: (col / (cols - 1) - 0.5) * gridSize + 5,
      y: (row / (cols - 1) - 0.5) * gridSize,
      z,
    };
  }

  return { x: 0, y: 0, z };
}

export const CURATED_PROMPTS = [
  "Paris is the capital of",
  "The Eiffel Tower is located in",
  "Tokyo is a city in",
  "The CEO of Apple is",
  "Water freezes at",
  "The color of the sky is",
  "One plus one equals",
  "The largest planet is",
  "Shakespeare wrote",
  "The speed of light is",
  "DNA stands for",
  "The chemical symbol for gold is",
  "Mount Everest is the",
  "The year World War II ended was",
  "Einstein developed the theory of",
  "The currency of Japan is",
  "Photosynthesis occurs in",
  "The human heart has",
  "Binary code uses",
  "Machine learning is a subset of",
];
