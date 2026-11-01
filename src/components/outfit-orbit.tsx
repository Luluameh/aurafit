"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  Component,
  Suspense,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import {
  BackSide,
  ClampToEdgeWrapping,
  FrontSide,
  SRGBColorSpace,
  TextureLoader,
  type Group,
} from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type ViewName = "Front" | "Side" | "Back";

type OutfitOrbitProps = {
  frontUrl: string | null;
  backUrl: string | null;
};

function textureUrl(src: string) {
  if (src.startsWith("/") || src.startsWith("blob:")) return src;
  return `/api/media?url=${encodeURIComponent(src)}`;
}

function usePhoto(src: string) {
  const texture = useLoader(TextureLoader, textureUrl(src), (loader) => {
    loader.setCrossOrigin("anonymous");
  });
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  return texture;
}

function PortraitArc({
  src,
  thetaStart,
}: {
  src: string;
  thetaStart: number;
}) {
  const map = usePhoto(src);
  return (
    <mesh>
      <cylinderGeometry args={[0.62, 0.62, 1.86, 56, 1, true, thetaStart, Math.PI * 0.86]} />
      <meshBasicMaterial map={map} side={FrontSide} toneMapped={false} />
    </mesh>
  );
}

function TurnRig({
  onView,
  turnTo,
}: {
  onView: (view: ViewName) => void;
  turnTo: MutableRefObject<number | null>;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const shown = useRef<ViewName>("Front");

  useFrame((_, delta) => {
    const orbit = controls.current;
    if (!orbit) return;

    if (turnTo.current != null) {
      const current = orbit.getAzimuthalAngle();
      const deltaAngle = Math.atan2(
        Math.sin(turnTo.current - current),
        Math.cos(turnTo.current - current),
      );
      const next = current + deltaAngle * Math.min(1, delta * 3.2);
      const radius = orbit.getDistance();
      orbit.object.position.set(Math.sin(next) * radius, 0.05, Math.cos(next) * radius);
      orbit.update();
      if (Math.abs(deltaAngle) < 0.03) turnTo.current = null;
    }

    const angle = Math.abs(orbit.getAzimuthalAngle());
    const view: ViewName = angle < 0.65 ? "Front" : angle > 2.45 ? "Back" : "Side";
    if (view !== shown.current) {
      shown.current = view;
      onView(view);
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableZoom={false}
      minPolarAngle={Math.PI / 2 - 0.18}
      maxPolarAngle={Math.PI / 2 + 0.12}
    />
  );
}

function Scene({
  frontUrl,
  backUrl,
  onView,
  turnTo,
}: OutfitOrbitProps & {
  onView: (view: ViewName) => void;
  turnTo: MutableRefObject<number | null>;
}) {
  const group = useRef<Group>(null);

  return (
    <>
      <color attach="background" args={["#eceae6"]} />
      <group ref={group}>
        <mesh>
          <cylinderGeometry args={[0.56, 0.56, 1.86, 32, 1, true]} />
          <meshBasicMaterial color="#1c1416" side={BackSide} />
        </mesh>
        {frontUrl && <PortraitArc src={frontUrl} thetaStart={-Math.PI * 0.43} />}
        {backUrl && <PortraitArc src={backUrl} thetaStart={Math.PI * 0.57} />}
      </group>
      <TurnRig onView={onView} turnTo={turnTo} />
    </>
  );
}

class OrbitBoundary extends Component<
  { children: ReactNode; frontUrl: string | null; backUrl: string | null },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      const src = this.props.frontUrl ?? this.props.backUrl;
      return src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : null;
    }
    return this.props.children;
  }
}

export function OutfitOrbit({ frontUrl, backUrl }: OutfitOrbitProps) {
  const [view, setView] = useState<ViewName>(frontUrl ? "Front" : "Back");
  const turnTo = useRef<number | null>(null);
  const missingBack = Boolean(frontUrl) && !backUrl;
  const missingFront = Boolean(backUrl) && !frontUrl;

  return (
    <div className="absolute inset-0">
      <OrbitBoundary frontUrl={frontUrl} backUrl={backUrl}>
        <Canvas
          className="h-full w-full"
          camera={{ position: [0, 0.05, frontUrl ? 2.55 : -2.55], fov: 32 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <Scene frontUrl={frontUrl} backUrl={backUrl} onView={setView} turnTo={turnTo} />
          </Suspense>
        </Canvas>
      </OrbitBoundary>
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
        <span className="bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-noir">
          {view}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 pb-[env(safe-area-inset-bottom)] sm:bottom-4 sm:gap-2">
        {(
          [
            ["Front", 0],
            ["Side", Math.PI / 2],
            ["Back", Math.PI],
          ] as const
        ).map(([label, angle]) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              turnTo.current = angle;
            }}
            className={`px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] sm:px-3 sm:py-2 sm:text-[10px] sm:tracking-[0.14em] ${
              view === label ? "bg-noir text-white" : "bg-white text-noir"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {((view === "Back" && missingBack) || (view === "Front" && missingFront)) && (
        <p className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-sm text-white">
          {missingBack
            ? "Add a back photo to see the outfit from behind."
            : "Add a front photo to see the outfit from the front."}
        </p>
      )}
    </div>
  );
}
