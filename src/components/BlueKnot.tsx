import { useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BlueKnotProps {
  scrollProgress: MutableRefObject<number>;
  mouseRef: MutableRefObject<{ x: number; y: number }>;
}

export function BlueKnot({ scrollProgress: _scrollProgress, mouseRef: _mouseRef }: BlueKnotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const targetScale = useRef(new THREE.Vector3(0.7, 0.7, 0.7));

  useFrame(({ clock }) => {
    if (!groupRef.current || !meshRef.current || !glowRef.current) return;

    const t = clock.getElapsedTime();
    const progress = _scrollProgress.current;
    const mouseX = _mouseRef.current.x;
    const mouseY = _mouseRef.current.y;

    const targetX = progress * 0.24 + mouseX * 0.08;
    const targetY = -0.08 + progress * 0.52 + mouseY * 0.07;
    const targetRotX = 0.04 + progress * 0.32 + mouseY * 0.06;
    const targetRotY = -0.18 + progress * 0.44 + mouseX * 0.08;

    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.075;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.075;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.045;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.045;
    targetScale.current.setScalar(0.52 - progress * 0.08);
    groupRef.current.scale.lerp(targetScale.current, 0.055);

    meshRef.current.rotation.x = Math.sin(t * 0.28) * 0.12 + progress * 0.18;
    meshRef.current.rotation.y = t * 0.32 + progress * 0.78;
    meshRef.current.rotation.z = t * 0.12;
    glowRef.current.rotation.x = Math.sin(t * 0.28) * 0.12 + progress * 0.18;
    glowRef.current.rotation.y = t * 0.32 + progress * 0.78;
    glowRef.current.rotation.z = t * 0.12;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.2, 0.35, 160, 36, 2, 3]} />
        <meshPhysicalMaterial
          color="#7891ff"
          emissive="#394fb8"
          emissiveIntensity={0.38}
          metalness={0.72}
          roughness={0.075}
          clearcoat={1}
          clearcoatRoughness={0.035}
          reflectivity={0.92}
          iridescence={0.36}
          iridescenceIOR={1.42}
        />
      </mesh>

      <mesh ref={glowRef} scale={1.045}>
        <torusKnotGeometry args={[1.2, 0.39, 160, 36, 2, 3]} />
        <meshBasicMaterial
          color="#bed1ff"
          transparent
          opacity={0.052}
          side={THREE.BackSide}
        />
      </mesh>

      <pointLight color="#93ddff" intensity={1.35} distance={8} position={[2.6, 2.2, 2.8]} />
      <pointLight color="#6d75ff" intensity={0.92} distance={7} position={[-2.4, -1.2, 3.2]} />
      <pointLight color="#ffffff" intensity={0.28} distance={6} position={[0, 3, 4]} />
    </group>
  );
}
