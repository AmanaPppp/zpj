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
  const groupRef = useRef<THREE.Group>(null!);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const nightLightsRef = useRef<THREE.Mesh | null>(null);
  const rotationY = useRef(0);

  useEffect(() => {
    if (!groupRef.current) return;

    const earth = createRealisticEarth(groupRef.current);
    cloudsRef.current = earth.clouds;
    nightLightsRef.current = earth.nightLights;

    return () => earth.dispose();
  }, []);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    const transitionProgress = smoothStep(scrollProgress.current / SECOND_SECTION_START);
    const interactionProgress = smoothStep((scrollProgress.current - SECOND_SECTION_START) / (1 - SECOND_SECTION_START));
    rotationY.current += delta * 0.09;

    const targetRotX = THREE.MathUtils.lerp(-0.34, 0, transitionProgress) + mouseRef.current.targetY * 0.11 * interactionProgress;
    const targetRotY = rotationY.current + mouseRef.current.targetX * 0.08 * interactionProgress;
    const targetRotZ = THREE.MathUtils.lerp(0.08, 0, transitionProgress) - mouseRef.current.targetX * 0.05 * interactionProgress;
    const targetScale = THREE.MathUtils.lerp(1.85, 0.86, transitionProgress);
    const targetY = THREE.MathUtils.lerp(-4.25, 0, transitionProgress);

    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 3));
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 3);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      delta * 3
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      delta * 3
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      targetRotZ,
      delta * 3
    );

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.018;
    }

    if (nightLightsRef.current) {
      nightLightsRef.current.rotation.y = groupRef.current.rotation.y;
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

  return <group ref={groupRef} position={[0, -4.25, 0]} scale={1.85} />;
}
