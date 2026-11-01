"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

function HangerRing() {
  const group = useRef<Group>(null);
  const inner = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (group.current) group.current.rotation.y = t * 0.85;
    if (inner.current) inner.current.rotation.x = Math.sin(t * 1.2) * 0.12;
  });

  return (
    <group ref={group}>
      <mesh ref={inner} rotation={[0.35, 0, 0]}>
        <torusGeometry args={[0.72, 0.028, 24, 96]} />
        <meshStandardMaterial color="#161513" metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.78, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.55, 16]} />
        <meshStandardMaterial color="#2a2826" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <torusKnotGeometry args={[0.38, 0.09, 96, 16]} />
        <meshStandardMaterial
          color="#8a5a32"
          wireframe
          transparent
          opacity={0.55}
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}

function LoaderScene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <spotLight position={[2, 3, 4]} intensity={18} angle={0.45} penumbra={0.6} color="#fff8f0" />
      <directionalLight position={[-2, 1, 2]} intensity={0.4} color="#ffd8c8" />
      <HangerRing />
    </>
  );
}

type FshLoader3DProps = {
  className?: string;
  cameraDistance?: number;
};

export function FshLoader3D({ className = "h-32 w-32", cameraDistance = 2.6 }: FshLoader3DProps) {
  const dpr = useMemo(() => [1, 1.75] as [number, number], []);

  return (
    <div className={className} aria-hidden>
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0.15, cameraDistance], fov: 38 }}
        dpr={dpr}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <LoaderScene />
      </Canvas>
    </div>
  );
}

type FshLoaderOverlayProps = {
  title: string;
  detail?: string;
  compact?: boolean;
};

export function FshLoaderOverlay({ title, detail, compact }: FshLoaderOverlayProps) {
  return (
    <div
      className={`flex flex-col items-center text-center ${compact ? "gap-3 px-4 py-6" : "gap-4 px-6 py-8"}`}
      role="status"
      aria-live="polite"
    >
      <FshLoader3D className={compact ? "h-24 w-24" : "h-32 w-32"} />
      <div>
        <p className="text-sm font-medium text-noir">{title}</p>
        {detail && (
          <p className="mt-2 text-xs leading-relaxed text-stone">{detail}</p>
        )}
      </div>
    </div>
  );
}
