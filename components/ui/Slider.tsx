"use client";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  label,
  className = "",
}: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {label && (
        <span className="font-mono text-[10px] text-fg-2 uppercase tracking-wider shrink-0">
          {label}
        </span>
      )}
      <div className="relative flex-1 h-6 flex items-center">
        <div className="absolute inset-y-0 left-0 right-0 flex items-center">
          <div className="w-full h-1 bg-surface-2 rounded-full">
            <div
              className="h-full bg-signal rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute w-3 h-3 bg-signal rounded-full shadow-lg pointer-events-none"
          style={{ left: `calc(${percent}% - 6px)` }}
        />
      </div>
      <span className="font-mono text-xs text-fg-1 tabular-nums w-12 text-right">
        {value.toFixed(2)}
      </span>
    </div>
  );
}
