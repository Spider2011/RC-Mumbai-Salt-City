'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { DoubleSide, MeshStandardMaterial, type Group, type Mesh, type MeshBasicMaterial } from 'three';
import { buildStops, riverPath, riverSlope, riverX, type RiverStop } from '@/lib/river';

const MODEL = '/models/paper-boat.glb';
const ANCHOR = 0.62; // the boat rides this far down the viewport
const SVG_WIDTH = 160;
const STEER = 10; // exaggerates the river's gentle bends into visible turns

const paper = new MeshStandardMaterial({
  color: '#f4eee3',
  roughness: 0.85,
  metalness: 0,
  flatShading: true,
  side: DoubleSide,
  emissive: '#3b2a12',
  emissiveIntensity: 0.35,
});

interface Layout {
  main: HTMLElement;
  stops: RiverStop[];
  mainTop: number;
  height: number;
  period: number;
  width: number;
  size: number;
}

function pageTop(el: HTMLElement): number {
  let top = 0;
  for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) top += e.offsetTop;
  return top;
}

function measure(main: HTMLElement): Layout {
  const width = window.innerWidth;
  const wide = width >= 1280;
  const center = width - (wide ? 64 : 48);
  const amp = wide ? 22 : 14;

  const sections = Array.from(main.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement && c.offsetHeight > 0,
  );
  const mirror = main.querySelector<HTMLElement>('[data-loop-mirror]');
  const mirrorTop = mirror ? pageTop(mirror) : undefined;
  const mainTop = pageTop(main);
  const height = main.offsetHeight;

  return {
    main,
    stops: buildStops(sections.map(pageTop), [center + amp, center - amp], mirrorTop),
    mainTop,
    height,
    period: mirrorTop ?? mainTop + height,
    width,
    size: wide ? 150 : 116,
  };
}

function Boat({ layoutRef, wrapRef }: { layoutRef: RefObject<Layout | null>; wrapRef: RefObject<HTMLDivElement | null> }) {
  const { scene } = useGLTF(MODEL, false);
  const model = useMemo(() => {
    const copy = scene.clone();
    copy.traverse((o) => {
      if ((o as Mesh).isMesh) (o as Mesh).material = paper;
    });
    return copy;
  }, [scene]);

  const yawRef = useRef<Group>(null);
  const bobRef = useRef<Group>(null);
  const rings = useRef<Mesh[]>([]);
  const yaw = useRef(-Math.PI / 2);
  const shown = useRef(false);

  useFrame(({ clock }, delta) => {
    const layout = layoutRef.current;
    const wrap = wrapRef.current;
    if (!layout || !wrap || !yawRef.current || !bobRef.current) return;

    const vh = window.innerHeight;
    const pageY = window.scrollY + vh * ANCHOR;
    const x = riverX(layout.stops, pageY);
    wrap.style.transform = `translate3d(${(x - layout.size / 2).toFixed(1)}px, ${(vh * ANCHOR - layout.size * 0.58).toFixed(1)}px, 0)`;
    if (!shown.current) {
      shown.current = true;
      wrap.style.opacity = '1';
    }

    // Heading follows the river: straight down is -90° (bow +x turned toward the camera).
    const target = Math.atan2(-1, riverSlope(layout.stops, pageY, 24) * STEER);
    yaw.current += (target - yaw.current) * Math.min(1, delta * 4);
    yawRef.current.rotation.y = yaw.current;

    const sv = parseFloat(document.documentElement.style.getPropertyValue('--sv')) || 0;
    const t = clock.elapsedTime;
    bobRef.current.rotation.x = Math.sin(t * 1.1) * 0.06 + sv * 0.35; // roll, leaning into speed
    bobRef.current.rotation.z = Math.sin(t * 1.4) * 0.04 + Math.abs(sv) * 0.12; // bow lifts when fast
    bobRef.current.position.y = Math.sin(t * 1.7) * 0.035;

    rings.current.forEach((ring, i) => {
      const phase = (t * 0.55 + i * 0.5) % 1;
      ring.scale.setScalar(0.7 + phase * 0.7);
      (ring.material as MeshBasicMaterial).opacity = (1 - phase) * (0.28 + Math.abs(sv) * 0.3);
    });
  });

  return (
    <group ref={yawRef} scale={0.72}>
      <group ref={bobRef}>
        <primitive object={model} />
      </group>
      {[0, 1].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) rings.current[i] = el;
          }}
          rotation-x={-Math.PI / 2}
          position-y={0.12}
        >
          <ringGeometry args={[0.95, 1, 64]} />
          <meshBasicMaterial color="#f6e7c8" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

export default function BoatScene() {
  const [layout, setLayout] = useState<Layout | null>(null);
  const layoutRef = useRef<Layout | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = measure(main);
        layoutRef.current = next;
        setLayout(next);
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(main);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const d = useMemo(
    () => (layout ? riverPath(layout.stops, layout.mainTop, layout.mainTop + layout.height, layout.width - SVG_WIDTH) : ''),
    [layout],
  );

  if (!layout) return null;

  return (
    <>
      {createPortal(
        <svg
          aria-hidden
          className="pointer-events-none absolute right-0 z-[5]"
          style={{ top: 0 }}
          width={SVG_WIDTH}
          height={layout.height}
          viewBox={`0 ${layout.mainTop} ${SVG_WIDTH} ${layout.height}`}
        >
          <defs>
            {/* Repeats every loop period so the river looks the same under the mirrored hero. */}
            <linearGradient id="rcmsc-river" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={layout.period} spreadMethod="repeat">
              <stop offset="0" stopColor="#D4AF37" />
              <stop offset="0.35" stopColor="#FF8A65" />
              <stop offset="0.7" stopColor="#4FC3F7" />
              <stop offset="1" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
          <path d={d} fill="none" stroke="url(#rcmsc-river)" strokeOpacity={0.08} strokeWidth={16} strokeLinecap="round" />
          <path d={d} fill="none" stroke="url(#rcmsc-river)" strokeOpacity={0.55} strokeWidth={1.5} />
          <path d={d} fill="none" stroke="url(#rcmsc-river)" strokeOpacity={0.22} strokeWidth={0.75} strokeDasharray="2 12" transform="translate(-7 0)" />
          <path d={d} fill="none" stroke="url(#rcmsc-river)" strokeOpacity={0.22} strokeWidth={0.75} strokeDasharray="2 12" transform="translate(7 0)" />
        </svg>,
        layout.main,
      )}
      {createPortal(
        <div
          ref={wrapRef}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-[25] transition-opacity duration-700"
          style={{ width: layout.size, height: layout.size, opacity: 0, willChange: 'transform' }}
        >
          <Canvas
            dpr={[1, 2]}
            gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
            camera={{ position: [1.3, 1.7, 3.2], fov: 32 }}
            onCreated={({ camera }) => camera.lookAt(0, 0.35, 0)}
            style={{ pointerEvents: 'none' }}
          >
            <ambientLight intensity={0.55} />
            <hemisphereLight args={['#fde7c2', '#1b2a4a', 0.7]} />
            <directionalLight position={[2.5, 4, 2]} intensity={1.6} color="#ffd9a0" />
            <Suspense fallback={null}>
              <Boat layoutRef={layoutRef} wrapRef={wrapRef} />
            </Suspense>
          </Canvas>
        </div>,
        document.body,
      )}
    </>
  );
}
