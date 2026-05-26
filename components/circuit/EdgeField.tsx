"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Architecture, Edge, TraceFrame, getNodePosition } from "@/lib/data";

interface EdgeFieldProps {
  edges: Edge[];
  architecture: Architecture;
  currentFrame: TraceFrame | null;
}

const SIGNAL_COLOR = new THREE.Color("#4fb3a9");
const INACTIVE_COLOR = new THREE.Color("#1b1e22");

export function EdgeField({ edges, architecture, currentFrame }: EdgeFieldProps) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const nodeMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number; z: number }>();
    for (const node of architecture.nodes) {
      map.set(node.id, getNodePosition(node, architecture));
    }
    return map;
  }, [architecture]);

  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];

    for (const edge of edges) {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) continue;

      positions.push(source.x, source.y, source.z);
      positions.push(target.x, target.y, target.z);

      colors.push(0.1, 0.12, 0.13);
      colors.push(0.1, 0.12, 0.13);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geom;
  }, [edges, nodeMap]);

  const activeEdgeSet = useMemo(() => {
    return new Set(currentFrame?.activeEdges || []);
  }, [currentFrame]);

  useFrame(() => {
    if (!lineRef.current) return;
    const colorAttr = lineRef.current.geometry.getAttribute(
      "color"
    ) as THREE.BufferAttribute;

    edges.forEach((edge, i) => {
      const isActive = activeEdgeSet.has(edge.id);
      const color = isActive ? SIGNAL_COLOR : INACTIVE_COLOR;
      const alpha = isActive ? 0.8 : 0.15;

      colorAttr.setXYZ(i * 2, color.r * alpha, color.g * alpha, color.b * alpha);
      colorAttr.setXYZ(
        i * 2 + 1,
        color.r * alpha,
        color.g * alpha,
        color.b * alpha
      );
    });

    colorAttr.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={1} />
    </lineSegments>
  );
}
