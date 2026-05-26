"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { Panel } from "@/components/chrome";
import { HeatMap } from "@/components/attention";
import {
  generateAttentionPattern,
  getTopAttentionPairs,
} from "@/lib/attention";
import { loadPromptTrace, PromptTrace, CURATED_PROMPTS } from "@/lib/data";

const BeamScene = dynamic(
  () => import("@/components/attention/BeamScene").then((m) => m.BeamScene),
  { ssr: false }
);

const LAYERS = 12;
const HEADS = 12;

export default function AttentionPage() {
  const { prompt, selectedLayer, setSelectedLayer, selectedHead, setSelectedHead } =
    useStore();
  const [promptTrace, setPromptTrace] = useState<PromptTrace | null>(null);
  const [viewMode, setViewMode] = useState<"heatmap" | "beams">("heatmap");

  useEffect(() => {
    loadPromptTrace(prompt).then(setPromptTrace);
  }, [prompt]);

  const tokens = useMemo(() => {
    if (promptTrace) return promptTrace.tokens;
    return prompt.split(/\s+/).filter(Boolean);
  }, [promptTrace, prompt]);

  const pattern = useMemo(() => {
    return generateAttentionPattern(tokens, selectedLayer, selectedHead);
  }, [tokens, selectedLayer, selectedHead]);

  const topPairs = useMemo(() => {
    return getTopAttentionPairs(pattern, 5);
  }, [pattern]);

  const isCurated = CURATED_PROMPTS.some(
    (p) => p.toLowerCase() === prompt.toLowerCase()
  );

  return (
    <div className="h-full flex">
      <div className="w-64 bg-surface-1 hairline-r p-4 flex flex-col gap-4 overflow-y-auto">
        <div>
          <label className="block font-mono text-[10px] text-fg-2 uppercase tracking-wider mb-2">
            Layer
          </label>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: LAYERS }, (_, i) => (
              <button
                key={i}
                onClick={() => setSelectedLayer(i + 1)}
                className={`font-mono text-[10px] py-1.5 rounded-sm transition-colors ${
                  selectedLayer === i + 1
                    ? "bg-signal text-surface-0"
                    : "bg-surface-2 text-fg-1 hover:bg-surface-3"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] text-fg-2 uppercase tracking-wider mb-2">
            Head
          </label>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: HEADS }, (_, i) => (
              <button
                key={i}
                onClick={() => setSelectedHead(i)}
                className={`font-mono text-[10px] py-1.5 rounded-sm transition-colors ${
                  selectedHead === i
                    ? "bg-signal text-surface-0"
                    : "bg-surface-2 text-fg-1 hover:bg-surface-3"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="hairline-t pt-4">
          <label className="block font-mono text-[10px] text-fg-2 uppercase tracking-wider mb-2">
            View
          </label>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("heatmap")}
              className={`flex-1 font-mono text-[10px] py-1.5 rounded-sm transition-colors ${
                viewMode === "heatmap"
                  ? "bg-signal text-surface-0"
                  : "bg-surface-2 text-fg-1 hover:bg-surface-3"
              }`}
            >
              Heatmap
            </button>
            <button
              onClick={() => setViewMode("beams")}
              className={`flex-1 font-mono text-[10px] py-1.5 rounded-sm transition-colors ${
                viewMode === "beams"
                  ? "bg-signal text-surface-0"
                  : "bg-surface-2 text-fg-1 hover:bg-surface-3"
              }`}
            >
              Beams
            </button>
          </div>
        </div>

        <Panel title="Current" className="mt-auto">
          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-fg-2">Layer</span>
              <span className="text-signal">L{selectedLayer.toString().padStart(2, "0")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-2">Head</span>
              <span className="text-signal">H{selectedHead.toString().padStart(2, "0")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-2">Tokens</span>
              <span className="text-fg-1">{tokens.length}</span>
            </div>
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

      <div className="flex-1 flex flex-col">
        <div className="p-4 hairline-b">
          <div className="font-mono text-xs text-fg-0">
            &quot;{prompt}&quot;
          </div>
          {!isCurated && (
            <div className="font-mono text-[10px] text-intervention mt-1">
              Using generated tokens
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          {viewMode === "heatmap" ? (
            <HeatMap pattern={pattern} width={450} height={450} />
          ) : (
            <div className="w-full h-full">
              <BeamScene pattern={pattern} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
