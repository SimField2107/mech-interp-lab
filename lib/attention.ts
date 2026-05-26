export interface AttentionPattern {
  sourceTokens: string[];
  targetTokens: string[];
  weights: number[][];
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

export function generateAttentionPattern(
  tokens: string[],
  layer: number,
  head: number
): AttentionPattern {
  const seed = layer * 1000 + head * 100 + tokens.join("").length;
  const rand = seededRandom(seed);

  const n = tokens.length;
  const weights: number[][] = [];

  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    let sum = 0;

    for (let j = 0; j < n; j++) {
      if (j > i) {
        row.push(0);
      } else {
        const base = rand();
        const positionBias = j === i ? 0.3 : j === 0 ? 0.2 : 0;
        const val = Math.pow(base + positionBias, 2);
        row.push(val);
        sum += val;
      }
    }

    for (let j = 0; j <= i; j++) {
      row[j] /= sum;
    }

    weights.push(row);
  }

  return {
    sourceTokens: tokens,
    targetTokens: tokens,
    weights,
  };
}

export function getTopAttentionPairs(
  pattern: AttentionPattern,
  topK: number = 10
): Array<{ source: number; target: number; weight: number }> {
  const pairs: Array<{ source: number; target: number; weight: number }> = [];

  for (let i = 0; i < pattern.weights.length; i++) {
    for (let j = 0; j < pattern.weights[i].length; j++) {
      if (pattern.weights[i][j] > 0) {
        pairs.push({ source: j, target: i, weight: pattern.weights[i][j] });
      }
    }
  }

  return pairs.sort((a, b) => b.weight - a.weight).slice(0, topK);
}
