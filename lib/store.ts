import { create } from "zustand";

interface LabState {
  prompt: string;
  setPrompt: (prompt: string) => void;

  playbackTime: number;
  setPlaybackTime: (t: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;

  ablateMode: boolean;
  toggleAblateMode: () => void;
  ablatedNodes: Set<string>;
  toggleAblation: (nodeId: string) => void;
  resetAblations: () => void;

  selectedLayer: number;
  setSelectedLayer: (layer: number) => void;
  selectedHead: number;
  setSelectedHead: (head: number) => void;

  hoveredNode: string | null;
  setHoveredNode: (nodeId: string | null) => void;
}

export const useStore = create<LabState>((set) => ({
  prompt: "Paris is the capital of",
  setPrompt: (prompt) => set({ prompt }),

  playbackTime: 0,
  setPlaybackTime: (playbackTime) => set({ playbackTime }),
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  ablateMode: false,
  toggleAblateMode: () => set((s) => ({ ablateMode: !s.ablateMode })),
  ablatedNodes: new Set<string>(),
  toggleAblation: (nodeId) =>
    set((s) => {
      const next = new Set(s.ablatedNodes);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return { ablatedNodes: next };
    }),
  resetAblations: () => set({ ablatedNodes: new Set() }),

  selectedLayer: 0,
  setSelectedLayer: (selectedLayer) => set({ selectedLayer }),
  selectedHead: 0,
  setSelectedHead: (selectedHead) => set({ selectedHead }),

  hoveredNode: null,
  setHoveredNode: (hoveredNode) => set({ hoveredNode }),
}));
