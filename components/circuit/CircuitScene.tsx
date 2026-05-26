"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import { Suspense, useRef, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { NodeField } from "./NodeField";
import { EdgeField } from "./EdgeField";
import { Architecture, Edge, TraceFrame } from "@/lib/data";

interface CircuitSceneProps {
  architecture: Architecture;
  edges: Edge[];
  currentFrame: TraceFrame | null;
  ablatedNodes: Set<string>;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
}

export interface CircuitSceneHandle {
  setCameraPosition: (position: number[], target: number[]) => void;
}

export const CircuitScene = forwardRef<CircuitSceneHandle, CircuitSceneProps>(
  function CircuitScene(
    {
      architecture,
      edges,
      currentFrame,
      ablatedNodes,
      onNodeClick,
      onNodeHover,
    },
    ref
  ) {
    const controlsRef = useRef<OrbitControlsImpl | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);

    useImperativeHandle(ref, () => ({
      setCameraPosition: (position: number[], target: number[]) => {
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        if (!camera || !controls) return;

        const startPos = camera.position.clone();
        const endPos = new THREE.Vector3(...position);
        const endTarget = new THREE.Vector3(...target);

        let progress = 0;
        const animate = () => {
          progress += 0.03;
          const t = easeOutCubic(Math.min(progress, 1));

          camera.position.lerpVectors(startPos, endPos, t);
          controls.target.lerp(endTarget, t);
          controls.update();

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        animate();
      },
    }));

    return (
      <Canvas
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        style={{ background: "#0b0c0e" }}
      >
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          position={[15, 10, 25]}
          fov={50}
        />
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={80}
          target={[5, 0, 18]}
        />

        <ambientLight intensity={0.3} />
        <pointLight position={[20, 20, 20]} intensity={0.5} />
        <pointLight position={[-10, 10, 30]} intensity={0.3} color="#4fb3a9" />

        <Suspense fallback={null}>
          <NodeField
            architecture={architecture}
            currentFrame={currentFrame}
            ablatedNodes={ablatedNodes}
            onNodeClick={onNodeClick}
            onNodeHover={onNodeHover}
          />
          <EdgeField
            edges={edges}
            architecture={architecture}
            currentFrame={currentFrame}
          />
        </Suspense>

        <gridHelper
          args={[60, 60, "#1b1e22", "#131518"]}
          position={[5, -5, 18]}
        />

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={0.5}
            mipmapBlur
          />
          <Vignette offset={0.3} darkness={0.6} />
        </EffectComposer>
      </Canvas>
    );
  }
);

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
