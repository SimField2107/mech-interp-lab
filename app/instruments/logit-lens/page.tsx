"use client";

import { useEffect, useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Panel } from "@/components/chrome";
import { Cascade } from "@/components/logit-lens";
import { generateLogitLensData, LogitLensData } from "@/lib/logit-lens";
import { loadPromptTrace, PromptTrace, CURATED_PROMPTS } from "@/lib/data";

export default function LogitLensPage() {
  const { prompt } = useStore();
  const [promptTrace, setPromptTrace] = useState<PromptTrace | null>(null);

  useEffect(() => {
    loadPromptTrace(prompt).then(setPromptTrace);
  }, [prompt]);

  const tokens = useMemo(() => {
    if (promptTrace) return promptTrace.tokens;
    return prompt.split(/\s+/).filter(Boolean);
  }, [promptTrace, prompt]);

  const prediction = useMemo(() => {
    if (promptTrace) return promptTrace.prediction;
    return "unknown";
  }, [promptTrace]);

  const logitLensData = useMemo<LogitLensData>(() => {
    return generateLogitLensData(prompt, tokens, prediction);
  }, [prompt, tokens, prediction]);

  const isCurated = CURATED_PROMPTS.some(
    (p) => p.toLowerCase() === prompt.toLowerCase()
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 hairline-b flex items-center gap-4">
        <div className="flex-1">
          <div className="font-mono text-xs text-fg-0">
            &quot;{prompt}&quot;
          </div>
          {promptTrace && (
            <div className="font-mono text-[10px] text-signal mt-1">
              → {promptTrace.prediction}
            </div>
          )}
          {!isCurated && (
            <div className="font-mono text-[10px] text-intervention mt-1">
              Using generated prediction
            </div>
          )}
        </div>

        <Panel className="w-auto">
          <div className="flex items-center gap-6 font-mono text-[10px]">
            <div className="flex items-center gap-2">
              <span className="text-fg-2">Layers</span>
              <span className="text-fg-1">12</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-fg-2">Top-K</span>
              <span className="text-fg-1">5</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-fg-2">Tokens</span>
              <span className="text-fg-1">{tokens.length}</span>
            </div>
          </div>
        </Panel>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Cascade data={logitLensData} />
      </div>

      <div className="p-4 hairline-t bg-surface-1">
        <div className="max-w-3xl mx-auto">
          <div className="font-mono text-[10px] text-fg-2 leading-relaxed">
            <strong className="text-fg-1">Logit Lens</strong> applies the
            unembedding matrix at each intermediate layer to see what the model
            would predict if forced to output at that point. Early layers show
            diffuse predictions; later layers converge on the final answer. The
            &quot;commit point&quot; is where the target token first dominates.
          </div>
        </div>
      </div>
    </div>
  );
}
