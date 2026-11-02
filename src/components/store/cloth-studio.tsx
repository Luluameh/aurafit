"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DoubleSide, PlaneGeometry, type BufferGeometry, type Mesh } from "three";

const PANEL_WIDTH = 2.8;
const PANEL_HEIGHT = 3.9;

function openAmount(time: number) {
  const phase = (Math.sin(time * 0.68 - Math.PI / 2) + 1) / 2;
  return phase * phase * (3 - 2 * phase);
}

function CurtainPanel({ side }: { side: 1 | -1 }) {
  const mesh = useRef<Mesh>(null);
  const geometry = useMemo(
    () => new PlaneGeometry(PANEL_WIDTH, PANEL_HEIGHT, 42, 56) as BufferGeometry,
    [],
  );
  const base = useMemo(() => {
    const positions = geometry.attributes.position;
    const x = new Float32Array(positions.count);
    const y = new Float32Array(positions.count);
    for (let i = 0; i < positions.count; i++) {
      x[i] = positions.getX(i);
      y[i] = positions.getY(i);
    }
    return { x, y };
  }, [geometry]);

  useFrame(({ clock }) => {
    const open = openAmount(clock.elapsedTime);
    const compress = 1 - open * 0.74;
    const half = PANEL_WIDTH / 2;
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x0 = base.x[i];
      const y0 = base.y[i];
      const x = half - (half - x0) * compress;
      const folds =
        Math.sin((x0 / half) * Math.PI * 7) * (0.05 + (1 - open) * 0.055);
      const sway = Math.sin(y0 * 2.4 + clock.elapsedTime * 1.35 + x0) * 0.012;
      const hem =
        y0 < -PANEL_HEIGHT * 0.32
          ? Math.sin(clock.elapsedTime * 1.5 + x0 * 5) * 0.018 * (1 - open * 0.4)
          : 0;
      positions.setX(i, x);
      positions.setY(i, y0 + hem);
      positions.setZ(i, folds + sway);
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    if (mesh.current) mesh.current.position.x = side * (1.22 + open * 1.15);
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      position={[side * 1.22, -0.12, 0.12]}
      scale={[side, 1, 1]}
    >
      <meshStandardMaterial
        color="#9a1830"
        roughness={0.58}
        metalness={0.06}
        side={DoubleSide}
      />
    </mesh>
  );
}

function Rail() {
  return (
    <mesh position={[0, 1.78, 0.16]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.028, 0.028, 5.4, 20]} />
      <meshStandardMaterial color="#2c2422" metalness={0.55} roughness={0.32} />
    </mesh>
  );
}

export function ClothStudio() {
  return (
    <div className="absolute inset-0">
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0.05, 4.15], fov: 34 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x000000, 0);
        scene.background = null;
      }}
    >
      <ambientLight intensity={0.45} />
      <spotLight
        position={[0, 2.4, 3.2]}
        angle={0.6}
        penumbra={0.7}
        intensity={16}
        color="#fff4ee"
      />
      <directionalLight position={[-1.5, 1, 2]} intensity={0.55} color="#ffd0d6" />
      <CurtainPanel side={-1} />
      <CurtainPanel side={1} />
      <Rail />
    </Canvas>
    </div>
  );
}
