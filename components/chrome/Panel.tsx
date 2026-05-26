import { ReactNode } from "react";

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, children, className = "" }: PanelProps) {
  return (
    <div
      className={`bg-surface-1 rounded-sm border border-rule-strong ${className}`}
    >
      {title && (
        <div className="px-3 py-2 hairline-b tick-marks">
          <span className="font-mono text-[10px] text-fg-2 tracking-wider uppercase">
            {title}
          </span>
        </div>
      )}
      <div className="p-3">{children}</div>
    </div>
  );
}
