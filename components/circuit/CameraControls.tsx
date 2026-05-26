"use client";

const PRESETS = [
  { id: "overview", label: "Overview", position: [15, 10, 25], target: [5, 0, 18] },
  { id: "front", label: "Front", position: [5, 0, -5], target: [5, 0, 18] },
  { id: "side", label: "Side", position: [30, 0, 18], target: [5, 0, 18] },
  { id: "top", label: "Top", position: [5, 30, 18], target: [5, 0, 18] },
];

export function CameraPresetButtons({
  onPresetChange,
}: {
  onPresetChange: (position: number[], target: number[]) => void;
}) {
  return (
    <div className="flex gap-1">
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onPresetChange(preset.position, preset.target)}
          className="font-mono text-[10px] text-fg-2 hover:text-signal uppercase tracking-wider px-2 py-1 bg-surface-2 hover:bg-surface-3 rounded-sm transition-colors"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
