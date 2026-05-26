"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { Slider } from "@/components/ui";
import { TraceFrame } from "@/lib/data";

interface PlaybackControllerProps {
  trace: TraceFrame[];
  onFrameChange: (frame: TraceFrame) => void;
}

export function PlaybackController({
  trace,
  onFrameChange,
}: PlaybackControllerProps) {
  const { playbackTime, setPlaybackTime, isPlaying, setIsPlaying } = useStore();
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      const speed = 0.0003;
      const newTime = playbackTime + delta * speed;

      if (newTime >= 1) {
        setPlaybackTime(1);
        setIsPlaying(false);
      } else {
        setPlaybackTime(newTime);
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    lastTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, playbackTime, setPlaybackTime, setIsPlaying]);

  useEffect(() => {
    if (trace.length === 0) return;

    const frameIdx = Math.min(
      Math.floor(playbackTime * trace.length),
      trace.length - 1
    );
    onFrameChange(trace[frameIdx]);
  }, [playbackTime, trace, onFrameChange]);

  const handlePlayPause = () => {
    if (playbackTime >= 1) {
      setPlaybackTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  return (
    <div className="flex items-center gap-4 bg-surface-1 p-3 rounded-sm border border-rule-strong">
      <button
        onClick={handlePlayPause}
        className="w-8 h-8 flex items-center justify-center bg-surface-2 hover:bg-surface-3 rounded-sm transition-colors"
      >
        {isPlaying ? (
          <PauseIcon />
        ) : (
          <PlayIcon />
        )}
      </button>

      <button
        onClick={handleReset}
        className="w-8 h-8 flex items-center justify-center bg-surface-2 hover:bg-surface-3 rounded-sm transition-colors"
      >
        <ResetIcon />
      </button>

      <Slider
        value={playbackTime}
        onChange={setPlaybackTime}
        min={0}
        max={1}
        step={0.01}
        label="t"
        className="flex-1"
      />
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="text-fg-1"
    >
      <path d="M2.5 1.5L10.5 6L2.5 10.5V1.5Z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="text-fg-1"
    >
      <rect x="2" y="1.5" width="3" height="9" fill="currentColor" />
      <rect x="7" y="1.5" width="3" height="9" fill="currentColor" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="text-fg-1"
    >
      <rect x="2" y="2" width="8" height="8" fill="currentColor" />
    </svg>
  );
}
