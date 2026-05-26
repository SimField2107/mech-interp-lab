export interface LayerPrediction {
  layer: number;
  topK: Array<{ token: string; prob: number }>;
}

export interface LogitLensData {
  prompt: string;
  tokens: string[];
  prediction: string;
  layers: LayerPrediction[];
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

const DISTRACTOR_TOKENS = [
  "the",
  "a",
  "is",
  "of",
  "to",
  "and",
  "in",
  "it",
  "that",
  "was",
  "for",
  "on",
  "are",
  "with",
  "as",
  "be",
  "at",
  "this",
  "have",
  "from",
];

export function generateLogitLensData(
  prompt: string,
  tokens: string[],
  prediction: string
): LogitLensData {
  const seed = prompt.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRandom(seed);

  const layers: LayerPrediction[] = [];
  const numLayers = 12;

  const commitPoint = Math.floor(rand() * 4) + 6;

  for (let l = 1; l <= numLayers; l++) {
    const progress = l / numLayers;
    const afterCommit = l >= commitPoint;

    let targetProb: number;
    if (afterCommit) {
      targetProb = 0.6 + (l - commitPoint) / (numLayers - commitPoint) * 0.3;
    } else {
      targetProb = 0.05 + progress * 0.2 + rand() * 0.1;
    }

    const topK: Array<{ token: string; prob: number }> = [];
    let remainingProb = 1 - targetProb;

    if (afterCommit) {
      topK.push({ token: prediction, prob: targetProb });
    }

    const usedTokens = new Set<string>([prediction]);
    const numDistractors = afterCommit ? 4 : 5;

    for (let i = 0; i < numDistractors; i++) {
      let token: string;
      do {
        token = DISTRACTOR_TOKENS[Math.floor(rand() * DISTRACTOR_TOKENS.length)];
      } while (usedTokens.has(token));
      usedTokens.add(token);

      const prob = remainingProb * (0.3 + rand() * 0.4);
      remainingProb -= prob;
      topK.push({ token, prob });
    }

    if (!afterCommit) {
      const insertPos = Math.floor(rand() * 3) + 1;
      topK.splice(insertPos, 0, { token: prediction, prob: targetProb });
      topK.pop();
    }

    topK.sort((a, b) => b.prob - a.prob);

    layers.push({ layer: l, topK: topK.slice(0, 5) });
  }

  return {
    prompt,
    tokens,
    prediction,
    layers,
  };
}

export function findCommitLayer(data: LogitLensData): number {
  for (const layer of data.layers) {
    if (layer.topK[0]?.token === data.prediction && layer.topK[0]?.prob > 0.5) {
      return layer.layer;
    }
  }
  return data.layers.length;
}
