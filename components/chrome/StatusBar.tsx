"use client";

import { useStore } from "@/lib/store";

export function StatusBar() {
  const { prompt, ablatedNodes, playbackTime } = useStore();
  const tokenCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;

  return (
    <footer className="h-6 bg-surface-1 hairline-t flex items-center px-4 gap-6 shrink-0">
      <StatusItem label="Tokens" value={tokenCount.toString().padStart(2, "0")} />
      <StatusItem
        label="Ablated"
        value={ablatedNodes.size.toString().padStart(2, "0")}
        highlight={ablatedNodes.size > 0}
      />
      <StatusItem label="t" value={playbackTime.toFixed(2)} />
      <div className="ml-auto flex items-center gap-2">
        <span className="font-mono text-[10px] text-fg-2">60 FPS</span>
        <div className="w-2 h-2 rounded-full bg-signal animate-pulse" />
      </div>
    </footer>
  );
}

function StatusItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-fg-2 uppercase">{label}</span>
      <span
        className={`font-mono text-xs ${highlight ? "text-intervention" : "text-fg-1"}`}
      >
        {value}
      </span>
    </div>
  );
}
