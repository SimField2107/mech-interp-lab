"use client";

import { useRef, useEffect, useMemo } from "react";
import { scaleSequential } from "d3-scale";
import { interpolateViridis } from "d3-scale-chromatic";
import { AttentionPattern } from "@/lib/attention";

interface HeatMapProps {
  pattern: AttentionPattern;
  width?: number;
  height?: number;
}

export function HeatMap({ pattern, width = 400, height = 400 }: HeatMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { sourceTokens, weights } = pattern;
  const n = sourceTokens.length;

  const margin = useMemo(() => ({ top: 60, right: 20, bottom: 20, left: 80 }), []);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const cellWidth = innerWidth / n;
  const cellHeight = innerHeight / n;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#0b0c0e";
    ctx.fillRect(0, 0, width, height);

    const colorScale = scaleSequential(interpolateViridis).domain([0, 1]);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const value = weights[i][j];
        const x = margin.left + j * cellWidth;
        const y = margin.top + i * cellHeight;

        if (value > 0) {
          ctx.fillStyle = colorScale(value);
        } else {
          ctx.fillStyle = "#131518";
        }
        ctx.fillRect(x, y, cellWidth - 1, cellHeight - 1);
      }
    }

    ctx.fillStyle = "#a0a6ad";
    ctx.font = "10px JetBrains Mono, monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let i = 0; i < n; i++) {
      const y = margin.top + i * cellHeight + cellHeight / 2;
      const label = sourceTokens[i].slice(0, 8);
      ctx.fillText(label, margin.left - 8, y);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    for (let j = 0; j < n; j++) {
      const x = margin.left + j * cellWidth + cellWidth / 2;
      ctx.save();
      ctx.translate(x, margin.top - 8);
      ctx.rotate(-Math.PI / 4);
      const label = sourceTokens[j].slice(0, 8);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }

    ctx.fillStyle = "#5e646b";
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText("Source Position →", width / 2, height - 4);

    ctx.save();
    ctx.translate(12, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Target Position →", 0, 0);
    ctx.restore();
  }, [pattern, width, height, n, cellWidth, cellHeight, margin, sourceTokens, weights]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-sm"
      style={{ width, height }}
    />
  );
}
