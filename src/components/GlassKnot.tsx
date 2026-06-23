import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createRealisticEarth } from '../lib/createRealisticEarth';

interface GlassKnotProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
  }>;
}

const SECOND_SECTION_START = 0.58;

const smoothStep = (value: number) => {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

export default function GlassKnot({ scrollProgress, mouseRef }: GlassKnotProps) {
  const earthGroupRef = useRef<THREE.Group>(null!);
  const earthSurfaceRef = useRef<THREE.Group | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const cloudOffsetY = useRef(0);
  const rotationY = useRef(0);

  useEffect(() => {
    if (!earthGroupRef.current) return;

    const earth = createRealisticEarth(earthGroupRef.current);
    earthSurfaceRef.current = earth.earthSurface;
    cloudsRef.current = earth.clouds;

    return () => earth.dispose();
  }, []);

  useFrame((_state, delta) => {
    if (!earthGroupRef.current) return;

    const transitionProgress = smoothStep(scrollProgress.current / SECOND_SECTION_START);
    const interactionProgress = smoothStep((scrollProgress.current - SECOND_SECTION_START) / (1 - SECOND_SECTION_START));
    rotationY.current += delta * 0.09;

    const targetRotX = THREE.MathUtils.lerp(-0.34, 0, transitionProgress) + mouseRef.current.targetY * 0.11 * interactionProgress;
    const targetRotY = mouseRef.current.targetX * 0.08 * interactionProgress;
    const targetRotZ = THREE.MathUtils.lerp(0.08, 0, transitionProgress) - mouseRef.current.targetX * 0.05 * interactionProgress;
    const targetScale = THREE.MathUtils.lerp(1.85, 0.86, transitionProgress);
    const targetY = THREE.MathUtils.lerp(-4.25, 0, transitionProgress);

    earthGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(earthGroupRef.current.scale.x, targetScale, delta * 3));
    earthGroupRef.current.position.y = THREE.MathUtils.lerp(earthGroupRef.current.position.y, targetY, delta * 3);
    earthGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      earthGroupRef.current.rotation.y,
      targetRotY,
      delta * 3
    );
    earthGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      earthGroupRef.current.rotation.x,
      targetRotX,
      delta * 3
    );
    earthGroupRef.current.rotation.z = THREE.MathUtils.lerp(
      earthGroupRef.current.rotation.z,
      targetRotZ,
      delta * 3
    );

    if (earthSurfaceRef.current) {
      earthSurfaceRef.current.rotation.y = rotationY.current;
    }

    if (cloudsRef.current) {
      cloudOffsetY.current += delta * 0.018;
      cloudsRef.current.rotation.y = rotationY.current + cloudOffsetY.current;
    }

    mouseRef.current.x = THREE.MathUtils.lerp(
      mouseRef.current.x,
      mouseRef.current.targetX,
      delta * 3
    );
    mouseRef.current.y = THREE.MathUtils.lerp(
      mouseRef.current.y,
      mouseRef.current.targetY,
      delta * 3
    );
  });

  return <group ref={earthGroupRef} name="earthGroup" position={[0, -4.25, 0]} scale={1.85} />;
}