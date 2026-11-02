"use client";

import { useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { DoubleSide, SRGBColorSpace, type Group } from "three";

function LogoTurn() {
  const group = useRef<Group>(null);
  const texture = useTexture("/brand/aurafit.png");
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!group.current) return;
    group.current.rotation.y = Math.sin(t * 0.9) * 0.55;
    group.current.rotation.x = 0.12 + Math.sin(t * 0.55) * 0.1;
  });

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[1.7, 1]} />
        <meshBasicMaterial
          map={texture}
          transparent
          depthWrite={false}
          toneMapped={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}

function LoaderScene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <spotLight position={[2.2, 2.4, 3.2]} intensity={16} angle={0.5} penumbra={0.65} color="#fff6e8" />
      <directionalLight position={[-2, 1, 1.5]} intensity={0.55} color="#f0d7a4" />
      <Suspense fallback={null}>
        <LogoTurn />
      </Suspense>
    </>
  );
}

type FshLoader3DProps = {
  className?: string;
  cameraDistance?: number;
};

export function FshLoader3D({ className = "h-36 w-44", cameraDistance = 3.15 }: FshLoader3DProps) {
  const dpr = useMemo(() => [1, 1.75] as [number, number], []);

  return (
    <div className={className} aria-hidden>
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0.02, cameraDistance], fov: 34 }}
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
      <FshLoader3D
        className={compact ? "h-28 w-40" : "h-36 w-52"}
        cameraDistance={compact ? 3.4 : 3.15}
      />
      <div>
        <p className="text-sm font-medium text-noir">{title}</p>
        {detail && (
          <p className="mt-2 text-xs leading-relaxed text-stone">{detail}</p>
        )}
      </div>
    </div>
  );
}
