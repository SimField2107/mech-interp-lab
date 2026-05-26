"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { PlaybackController } from "@/components/circuit";
import { LogitReadout } from "@/components/circuit/LogitReadout";
import { CameraPresetButtons } from "@/components/circuit/CameraControls";
import { Panel } from "@/components/chrome";
import type { CircuitSceneHandle } from "@/components/circuit/CircuitScene";
import {
  Architecture,
  Edge,
  TraceFrame,
  PromptTrace,
  loadArchitecture,
  loadEdges,
  loadPromptTrace,
  CURATED_PROMPTS,
} from "@/lib/data";

const CircuitScene = dynamic(
  () => import("@/components/circuit/CircuitScene").then((m) => m.CircuitScene),
  { ssr: false }
);

export default function CircuitPage() {
  const {
    prompt,
    ablatedNodes,
    toggleAblation,
    ablateMode,
    setHoveredNode,
    hoveredNode,
  } = useStore();
  const [architecture, setArchitecture] = useState<Architecture | null>(null);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [promptTrace, setPromptTrace] = useState<PromptTrace | null>(null);
  const [currentFrame, setCurrentFrame] = useState<TraceFrame | null>(null);
  const [loading, setLoading] = useState(true);
  const sceneRef = useRef<CircuitSceneHandle>(null);

  useEffect(() => {
    Promise.all([loadArchitecture(), loadEdges()]).then(([arch, edg]) => {
      setArchitecture(arch);
      setEdges(edg);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadPromptTrace(prompt).then((trace) => {
      setPromptTrace(trace);
      if (trace && trace.trace.length > 0) {
        setCurrentFrame(trace.trace[0]);
      }
    });
  }, [prompt]);

  const handleFrameChange = useCallback((frame: TraceFrame) => {
    setCurrentFrame(frame);
  }, []);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (ablateMode) {
        toggleAblation(nodeId);
      }
    },
    [ablateMode, toggleAblation]
  );

  const handleCameraPreset = useCallback(
    (position: number[], target: number[]) => {
      sceneRef.current?.setCameraPosition(position, target);
    },
    []
  );

  if (loading || !architecture) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-signal text-xs mb-2 animate-pulse">
            Initializing
          </div>
          <div className="font-mono text-fg-2 text-[10px]">
            Loading model architecture...
          </div>
        </div>
      </div>
    );
  }

  const isCurated = CURATED_PROMPTS.some(
    (p) => p.toLowerCase() === prompt.toLowerCase()
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <CircuitScene
          ref={sceneRef}
          architecture={architecture}
          edges={edges}
          currentFrame={currentFrame}
          ablatedNodes={ablatedNodes}
          onNodeClick={handleNodeClick}
          onNodeHover={setHoveredNode}
        />

        <div className="absolute top-4 left-4 flex flex-col gap-3">
          <Panel title="Prompt" className="w-64">
            <p className="font-mono text-xs text-fg-0 mb-2">
              &quot;{prompt}&quot;
            </p>
            {promptTrace && (
              <p className="font-mono text-[10px] text-signal">
                → {promptTrace.prediction}
              </p>
            )}
            {!isCurated && (
              <p className="font-mono text-[10px] text-intervention mt-2">
                Using generic trace
              </p>
            )}
          </Panel>

          <LogitReadout promptTrace={promptTrace} ablatedNodes={ablatedNodes} />

          {hoveredNode && (
            <Panel className="w-64">
              <div className="font-mono text-[10px]">
                <span className="text-fg-2">Node: </span>
                <span className="text-signal">{hoveredNode}</span>
              </div>
            </Panel>
          )}
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-3">
          <Panel title="View" className="w-auto">
            <CameraPresetButtons onPresetChange={handleCameraPreset} />
          </Panel>

          <Panel title="Architecture" className="w-48">
            <div className="space-y-2 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-fg-2">Layers</span>
                <span className="text-fg-1">{architecture.layers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-2">Heads</span>
                <span className="text-fg-1">{architecture.headsPerLayer}/layer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-2">Hidden</span>
                <span className="text-fg-1">{architecture.hiddenDim}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-2">Nodes</span>
                <span className="text-fg-1">{architecture.nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-2">Edges</span>
                <span className="text-fg-1">{edges.length}</span>
              </div>
            </div>
          </Panel>

          {currentFrame && (
            <Panel title="Frame" className="w-48">
              <div className="space-y-2 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-fg-2">Active Nodes</span>
                  <span className="text-signal">
                    {currentFrame.activeNodes.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-2">Active Edges</span>
                  <span className="text-signal">
                    {currentFrame.activeEdges.length}
                  </span>
                </div>
              </div>
            </Panel>
          )}
        </div>

        {ablateMode && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
            <div className="bg-intervention/90 text-surface-0 px-4 py-2 rounded-sm font-mono text-xs uppercase tracking-wider">
              Ablation Mode — Click nodes to toggle
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-surface-0 hairline-t">
        {promptTrace ? (
          <PlaybackController
            trace={promptTrace.trace}
            onFrameChange={handleFrameChange}
          />
        ) : (
          <div className="h-14 flex items-center justify-center">
            <span className="font-mono text-[10px] text-fg-2">
              No trace available for this prompt
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
