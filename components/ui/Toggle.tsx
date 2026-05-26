"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  className = "",
}: ToggleProps) {
  return (
    <label
      className={`flex items-center gap-2 cursor-pointer select-none ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-8 h-4 rounded-full transition-colors ${
          checked ? "bg-signal" : "bg-surface-3"
        }`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-fg-0 shadow transition-transform ${
            checked ? "left-4" : "left-0.5"
          }`}
        />
      </button>
      {label && (
        <span className="font-mono text-[10px] text-fg-1 uppercase tracking-wider">
          {label}
        </span>
      )}
    </label>
  );
}
