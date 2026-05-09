import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Particle = {
  baseX: number;
  baseY: number;
  baseZ: number;
  scale: number;
  speed: number;
  phase: number;
  drift: number;
};

interface PhysicalSpotlightParticlesProps {
  mouseRef: React.MutableRefObject<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
  }>;
}

const PARTICLE_COUNT = 900;

export default function PhysicalSpotlightParticles({
  mouseRef,
}: PhysicalSpotlightParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => {
      const radius = Math.random() * 58;
      const angle = Math.random() * Math.PI * 2;

      return {
        baseX: Math.cos(angle) * radius + (Math.random() - 0.5) * 14,
        baseY: Math.random() * 85 - 12,
        baseZ: Math.sin(angle) * radius - 36 + (Math.random() - 0.5) * 14,
        scale: 0.16 + Math.random() * 0.34,
        speed: 0.15 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        drift: 0.4 + Math.random() * 1.2,
      };
    });
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.elapsedTime;

    particles.forEach((particle, index) => {
      dummy.position.set(
        particle.baseX +
          Math.sin(time * particle.speed + particle.phase) * particle.drift +
          mouseRef.current.x * 0.7,
        particle.baseY +
          Math.cos(time * particle.speed * 0.7 + particle.phase) * particle.drift +
          mouseRef.current.y * 0.45,
        particle.baseZ +
          Math.sin(time * particle.speed * 0.55 + particle.phase) * particle.drift
      );

      dummy.scale.setScalar(particle.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(index, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[0.45, 12, 12]} />
      <meshStandardMaterial
        color="#9ecbff"
        roughness={0.58}
        metalness={0.12}
      />
    </instancedMesh>
  );
}
