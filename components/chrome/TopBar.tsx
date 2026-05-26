"use client";

import { useStore } from "@/lib/store";
import { usePathname } from "next/navigation";

export function TopBar() {
  const { prompt, setPrompt, ablateMode, toggleAblateMode, resetAblations } =
    useStore();
  const pathname = usePathname();
  const isInstrument = pathname.startsWith("/instruments");

  return (
    <header className="h-12 bg-surface-1 hairline-b flex items-center px-4 gap-4 shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-signal tracking-wider uppercase">
          MIL
        </span>
        <span className="font-mono text-[10px] text-fg-2">v0.1</span>
      </div>

      {isInstrument && (
        <>
          <div className="h-6 w-px bg-rule-strong" />

          <div className="flex-1 max-w-xl">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter prompt (e.g., 'Paris is the capital of')"
              className="w-full h-8 px-3 text-xs"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
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
        </>
      )}
    </header>
  );
}
