"use client";

import { useMemo } from "react";
import { LogitLensData, findCommitLayer } from "@/lib/logit-lens";

interface CascadeProps {
  data: LogitLensData;
}

export function Cascade({ data }: CascadeProps) {
  const commitLayer = useMemo(() => findCommitLayer(data), [data]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="font-mono text-xs text-fg-2">
          Prediction evolves through layers →
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-signal" />
          <span className="font-mono text-[10px] text-fg-2">Target token</span>
        </div>
      </div>

      <div className="space-y-2">
        {data.layers.map((layer) => {
          const isCommit = layer.layer === commitLayer;
          const afterCommit = layer.layer >= commitLayer;

          return (
            <div
              key={layer.layer}
              className={`flex items-center gap-3 p-2 rounded-sm transition-colors ${
                isCommit ? "bg-signal/10 border border-signal/30" : ""
              }`}
            >
              <div className="w-12 shrink-0">
                <span
                  className={`font-mono text-xs ${
                    afterCommit ? "text-signal" : "text-fg-2"
                  }`}
                >
                  L{layer.layer.toString().padStart(2, "0")}
                </span>
              </div>

              <div className="flex-1 flex items-center gap-1">
                {layer.topK.map((item, i) => {
                  const isTarget = item.token === data.prediction;
                  const width = Math.max(item.prob * 100, 5);

                  return (
                    <div
                      key={i}
                      className="relative group"
                      style={{ width: `${width}%`, minWidth: 40 }}
                    >
                      <div
                        className={`h-8 rounded-sm flex items-center justify-center overflow-hidden transition-colors ${
                          isTarget
                            ? "bg-signal text-surface-0"
                            : "bg-surface-2 text-fg-1"
                        }`}
                      >
                        <span className="font-mono text-[10px] truncate px-1">
                          {item.token}
                        </span>
                      </div>
                      <div className="absolute -bottom-5 left-0 right-0 text-center">
                        <span
                          className={`font-mono text-[9px] tabular-nums ${
                            isTarget ? "text-signal" : "text-fg-2"
                          }`}
                        >
                          {(item.prob * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isCommit && (
                <div className="shrink-0 font-mono text-[10px] text-signal uppercase tracking-wider">
                  Commit
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-4 bg-surface-1 rounded-sm border border-rule-strong">
        <div className="font-mono text-[10px] text-fg-2 uppercase tracking-wider mb-3">
          Summary
        </div>
        <div className="grid grid-cols-3 gap-4 font-mono text-xs">
          <div>
            <div className="text-fg-2 text-[10px] mb-1">Commit Layer</div>
            <div className="text-signal text-lg">L{commitLayer}</div>
          </div>
          <div>
            <div className="text-fg-2 text-[10px] mb-1">Final Confidence</div>
            <div className="text-fg-0 text-lg">
              {(data.layers[data.layers.length - 1].topK[0].prob * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-fg-2 text-[10px] mb-1">Predicted</div>
            <div className="text-signal text-lg">{data.prediction}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
