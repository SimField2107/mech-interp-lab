"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import * as THREE from "three";
import { AttentionPattern, getTopAttentionPairs } from "@/lib/attention";

interface BeamSceneProps {
  pattern: AttentionPattern;
}

export function BeamScene({ pattern }: BeamSceneProps) {
  const { sourceTokens } = pattern;
  const topPairs = useMemo(() => getTopAttentionPairs(pattern, 15), [pattern]);

  const tokenPositions = useMemo(() => {
    return sourceTokens.map((_, i) => {
      const x = (i - (sourceTokens.length - 1) / 2) * 1.5;
      return new THREE.Vector3(x, 0, 0);
    });
  }, [sourceTokens]);

  return (
    <Canvas
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.5]}
      style={{ background: "#0b0c0e" }}
    >
      <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={50} />
      <OrbitControls enableDamping dampingFactor={0.05} target={[0, 2, 0]} />

      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />

      {sourceTokens.map((token, i) => (
        <group key={i} position={tokenPositions[i]}>
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#4fb3a9" emissive="#4fb3a9" emissiveIntensity={0.3} />
          </mesh>
          <Text
            position={[0, -0.5, 0]}
            fontSize={0.25}
            color="#a0a6ad"
            anchorX="center"
            anchorY="top"
            font="/fonts/JetBrainsMono-Regular.ttf"
          >
            {token.slice(0, 6)}
          </Text>
        </group>
      ))}

      {topPairs.map((pair, i) => (
        <AttentionBeam
          key={i}
          start={tokenPositions[pair.source]}
          end={tokenPositions[pair.target]}
          weight={pair.weight}
        />
      ))}

      <gridHelper args={[20, 20, "#1b1e22", "#131518"]} position={[0, -1, 0]} />
    </Canvas>
  );
}

function AttentionBeam({
  start,
  end,
  weight,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  weight: number;
}) {
  const curve = useMemo(() => {
    const height = 2 + weight * 3;
    const mid = new THREE.Vector3(
      (start.x + end.x) / 2,
      height,
      (start.z + end.z) / 2
    );
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, end, weight]);

  const thickness = 0.02 + weight * 0.08;
  const opacity = 0.3 + weight * 0.7;

  return (
    <mesh>
      <tubeGeometry args={[curve, 32, thickness, 8, false]} />
      <meshStandardMaterial
        color="#4fb3a9"
        transparent
        opacity={opacity * 0.8}
        emissive="#4fb3a9"
        emissiveIntensity={weight * 0.5}
      />
    </mesh>
  );
}
