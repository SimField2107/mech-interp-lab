"use client";

import { useEffect, useState } from "react";

interface DesktopGateProps {
  children: React.ReactNode;
  minWidth?: number;
}

export function DesktopGate({ children, minWidth = 900 }: DesktopGateProps) {
  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  useEffect(() => {
    const check = () => setWindowWidth(window.innerWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (windowWidth === null) return null;

  const isDesktop = windowWidth >= minWidth;

  if (!isDesktop) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-surface-0">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-surface-2 rounded-sm flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-fg-2"
            >
              <rect
                x="2"
                y="4"
                width="20"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 21h8M12 18v3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className="font-mono text-sm text-fg-0 mb-3">
            Desktop Recommended
          </h2>
          <p className="text-fg-2 text-sm leading-relaxed mb-6">
            This instrument uses 3D visualization that works best on larger
            screens. Please visit on a desktop browser for the full experience.
          </p>
          <div className="font-mono text-[10px] text-fg-2">
            Min width: {minWidth}px · Current: {windowWidth}px
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
