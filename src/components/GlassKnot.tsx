import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createRealisticEarth } from '../lib/createRealisticEarth';

interface GlassKnotProps {
  mouseRef: React.MutableRefObject<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
  }>;
}

export default function GlassKnot({ mouseRef }: GlassKnotProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const rotationY = useRef(0);

  useEffect(() => {
    if (!groupRef.current) return;

    const earth = createRealisticEarth(groupRef.current);
    cloudsRef.current = earth.clouds;

    return () => earth.dispose();
  }, []);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    rotationY.current += delta * 0.15;

    const targetRotX = mouseRef.current.targetY * 0.1;
    const targetRotZ = -mouseRef.current.targetX * 0.05;

    groupRef.current.rotation.y = rotationY.current;
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
      cloudsRef.current.rotation.y += delta * 0.025;
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

  return <group ref={groupRef} position={[0, 0, 0]} scale={0.75} />;
}
