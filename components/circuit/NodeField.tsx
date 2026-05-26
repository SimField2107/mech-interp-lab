"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { Architecture, TraceFrame, getNodePosition } from "@/lib/data";

interface NodeFieldProps {
  architecture: Architecture;
  currentFrame: TraceFrame | null;
  ablatedNodes: Set<string>;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
}

const SIGNAL_COLOR = new THREE.Color("#4fb3a9");
const INTERVENTION_COLOR = new THREE.Color("#d87b3c");
const INACTIVE_COLOR = new THREE.Color("#2a2e35");
const BASE_SIZE = 0.15;

export function NodeField({
  architecture,
  currentFrame,
  ablatedNodes,
  onNodeClick,
  onNodeHover,
}: NodeFieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const nodePositions = useMemo(() => {
    return architecture.nodes.map((node) => ({
      node,
      position: getNodePosition(node, architecture),
    }));
  }, [architecture]);

  const activeSet = useMemo(() => {
    return new Set(currentFrame?.activeNodes || []);
  }, [currentFrame]);

  useEffect(() => {
    if (!meshRef.current) return;

    nodePositions.forEach(({ position }, i) => {
      tempObject.position.set(position.x, position.y, position.z);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [nodePositions, tempObject]);

  useFrame(() => {
    if (!meshRef.current) return;

    nodePositions.forEach(({ node: nodeData }, i) => {
      const isActive = activeSet.has(nodeData.id);
      const isAblated = ablatedNodes.has(nodeData.id);
      const activation = currentFrame?.activations[nodeData.id] || 0;

      if (isAblated) {
        tempColor.copy(INTERVENTION_COLOR);
      } else if (isActive) {
        tempColor.copy(SIGNAL_COLOR).multiplyScalar(0.5 + activation * 0.5);
      } else {
        tempColor.copy(INACTIVE_COLOR);
      }

      meshRef.current!.setColorAt(i, tempColor);

      const scale = isActive ? BASE_SIZE * (1 + activation * 0.5) : BASE_SIZE;
      tempObject.position.set(
        nodePositions[i].position.x,
        nodePositions[i].position.y,
        nodePositions[i].position.z
      );
      tempObject.scale.setScalar(scale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined && onNodeClick) {
      const node = nodePositions[e.instanceId]?.node;
      if (node) onNodeClick(node.id);
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined && onNodeHover) {
      const node = nodePositions[e.instanceId]?.node;
      if (node) onNodeHover(node.id);
    }
  };

  const handlePointerOut = () => {
    if (onNodeHover) onNodeHover(null);
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, architecture.nodes.length]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial toneMapped={false} />
    </instancedMesh>
  );
}
