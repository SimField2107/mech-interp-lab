interface MonoLabelProps {
  value: string | number;
  label?: string;
  className?: string;
}

export function MonoLabel({ value, label, className = "" }: MonoLabelProps) {
  const formatted =
    typeof value === "number"
      ? value.toFixed(2).padStart(6, "0")
      : String(value);

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      {label && (
        <span className="font-mono text-[10px] text-fg-2 uppercase tracking-wider">
          {label}
        </span>
      )}
      <span className="font-mono text-xs text-fg-1 tabular-nums">{formatted}</span>
    </div>
  );
}
