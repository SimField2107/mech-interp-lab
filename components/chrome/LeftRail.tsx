"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const instruments = [
  {
    id: "circuit",
    label: "Circuit",
    path: "/instruments/circuit",
    description: "Activation flow",
  },
  {
    id: "attention",
    label: "Attention",
    path: "/instruments/attention",
    description: "Head patterns",
  },
  {
    id: "logit-lens",
    label: "Logit Lens",
    path: "/instruments/logit-lens",
    description: "Layer predictions",
  },
];

export function LeftRail() {
  const pathname = usePathname();

  return (
    <nav className="w-48 bg-surface-1 hairline-r flex flex-col shrink-0">
      <div className="p-3 hairline-b">
        <span className="font-mono text-[10px] text-fg-2 tracking-wider uppercase">
          Instruments
        </span>
      </div>

      <div className="flex-1 py-2">
        {instruments.map((inst) => {
          const isActive = pathname === inst.path;
          return (
            <Link
              key={inst.id}
              href={inst.path}
              className={`block px-3 py-2 transition-colors ${
                isActive
                  ? "bg-surface-2 border-l-2 border-signal"
                  : "border-l-2 border-transparent hover:bg-surface-0/50"
              }`}
            >
              <span
                className={`font-mono text-xs ${isActive ? "text-fg-0" : "text-fg-1"}`}
              >
                {inst.label}
              </span>
              <span className="block font-mono text-[10px] text-fg-2 mt-0.5">
                {inst.description}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 hairline-t">
        <Link
          href="/methodology"
          className="font-mono text-[10px] text-fg-2 hover:text-fg-1 tracking-wider uppercase transition-colors"
        >
          Methodology
        </Link>
      </div>
    </nav>
  );
}
