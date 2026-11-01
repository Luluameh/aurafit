"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { SRGBColorSpace, TextureLoader, type Texture } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type AttireTurnProps = {
  frontUrl: string;
  backUrl: string;
  sideUrl: string;
  view: "Front" | "Side" | "Back";
  onView: (view: "Front" | "Side" | "Back") => void;
};

const DISTANCE = 5.6;
const FIGURE_HEIGHT = 2.05;

function Figure({ frontUrl, backUrl, sideUrl }: Pick<AttireTurnProps, "frontUrl" | "backUrl" | "sideUrl">) {
  const maps = useLoader(TextureLoader, [frontUrl, backUrl, sideUrl]);
  useLayoutEffect(() => {
    for (const texture of maps) {
      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [maps]);

  const [front, back, side] = maps as [Texture, Texture, Texture];
  const image = front.image as { width?: number; height?: number };
  const aspect = (image.width || 3) / (image.height || 4);
  const height = FIGURE_HEIGHT;
  const width = height * aspect;
  const depth = 0.34;

  return (
    <group>
      <mesh position={[0, 0, depth / 2]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={front} transparent alphaTest={0.08} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -depth / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={back} transparent alphaTest={0.08} toneMapped={false} />
      </mesh>
      <mesh position={[width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshBasicMaterial map={side} toneMapped={false} />
      </mesh>
      <mesh position={[-width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshBasicMaterial map={side} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function AttireTurn({ frontUrl, backUrl, sideUrl, view, onView }: AttireTurnProps) {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useMemo(
    () => ({ position: [0, 0, DISTANCE] as [number, number, number], fov: 32 }),
    [],
  );

  function turn(next: "Front" | "Side" | "Back") {
    const angle = next === "Front" ? 0 : next === "Side" ? Math.PI / 2 : Math.PI;
    const orbit = controls.current;
    if (orbit) {
      orbit.object.position.set(Math.sin(angle) * DISTANCE, 0, Math.cos(angle) * DISTANCE);
      orbit.target.set(0, 0, 0);
      orbit.update();
    }
    onView(next);
  }

  return (
    <div className="absolute inset-0">
      <Canvas camera={camera} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={["#eceae6"]} />
        <Suspense fallback={null}>
          <Figure frontUrl={frontUrl} backUrl={backUrl} sideUrl={sideUrl} />
        </Suspense>
        <OrbitControls
          ref={controls}
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2 - 0.2}
          maxPolarAngle={Math.PI / 2 + 0.12}
          target={[0, 0, 0]}
        />
      </Canvas>
      <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
        {(["Front", "Side", "Back"] as const).map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => turn(label)}
            className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] ${
              view === label ? "bg-noir text-white" : "bg-white text-noir"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
