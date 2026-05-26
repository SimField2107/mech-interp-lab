"use client";

import { useMemo } from "react";
import { Panel } from "@/components/chrome";
import { PromptTrace, AblationResult } from "@/lib/data";

interface LogitReadoutProps {
  promptTrace: PromptTrace | null;
  ablatedNodes: Set<string>;
}

export function LogitReadout({ promptTrace, ablatedNodes }: LogitReadoutProps) {
  const activeAblation = useMemo<AblationResult | null>(() => {
    if (!promptTrace || ablatedNodes.size === 0) return null;

    for (const nodeId of ablatedNodes) {
      const ablation = promptTrace.ablations.find((a) => a.nodeId === nodeId);
      if (ablation) return ablation;
    }
    return null;
  }, [promptTrace, ablatedNodes]);

  if (!promptTrace) return null;

  const baseline = promptTrace.baselineTopK;
  const current = activeAblation?.topK || baseline;
  const delta = activeAblation?.deltaFromBaseline || 0;

  return (
    <Panel title="Logit Readout" className="w-72">
      <div className="space-y-3">
        <div className="flex items-center justify-between font-mono text-[10px]">
          <span className="text-fg-2 uppercase tracking-wider">Prediction</span>
          {activeAblation && (
            <span
              className={`${delta < -0.2 ? "text-critical" : delta < 0 ? "text-intervention" : "text-signal"}`}
            >
              {delta > 0 ? "+" : ""}
              {(delta * 100).toFixed(1)}%
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {current.slice(0, 5).map((item, i) => {
            const baselineItem = baseline[i];
            const changed =
              activeAblation && item.prob !== baselineItem?.prob;

            return (
              <div key={i} className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-fg-2 w-4">
                  {i + 1}.
                </span>
                <div className="flex-1 h-4 bg-surface-2 rounded-sm overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      changed ? "bg-intervention" : "bg-signal"
                    }`}
                    style={{ width: `${item.prob * 100}%` }}
                  />
                </div>
                <span
                  className={`font-mono text-xs w-16 truncate ${
                    i === 0 ? "text-fg-0" : "text-fg-1"
                  }`}
                >
                  {item.token}
                </span>
                <span className="font-mono text-[10px] text-fg-2 tabular-nums w-12 text-right">
                  {(item.prob * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>

        {ablatedNodes.size > 0 && (
          <div className="pt-2 border-t border-rule">
            <div className="font-mono text-[10px] text-fg-2 uppercase tracking-wider mb-1">
              Ablated
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from(ablatedNodes)
                .slice(0, 6)
                .map((nodeId) => (
                  <span
                    key={nodeId}
                    className="font-mono text-[10px] text-intervention bg-intervention/10 px-1.5 py-0.5 rounded-sm"
                  >
                    {nodeId}
                  </span>
                ))}
              {ablatedNodes.size > 6 && (
                <span className="font-mono text-[10px] text-fg-2">
                  +{ablatedNodes.size - 6}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
