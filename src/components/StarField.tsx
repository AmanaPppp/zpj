import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function StarField() {
  const starsRef = useRef<THREE.Points>(null);
  const rocksRef = useRef<THREE.Group>(null);

  // Generate star positions
  const starPositions = useMemo(() => {
    const count = 4000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
    }
    return positions;
  }, []);

  // Generate floating geometry positions
  const rocks = useMemo(() => {
    const rockData = [];
    for (let i = 0; i < 12; i++) {
      rockData.push({
        position: [
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 15 - 5,
        ] as [number, number, number],
        scale: Math.random() * 0.08 + 0.04,
        rotationSpeed: [
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
        ] as [number, number, number],
        type: Math.floor(Math.random() * 3),
      });
    }
    return rockData;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Very subtle ambient rotation on stars
    if (starsRef.current) {
      starsRef.current.rotation.y = t * 0.005;
    }

    // Animate floating rocks
    if (rocksRef.current) {
      rocksRef.current.children.forEach((rock, i) => {
        rock.rotation.x += rocks[i].rotationSpeed[0];
        rock.rotation.y += rocks[i].rotationSpeed[1];
        rock.rotation.z += rocks[i].rotationSpeed[2];

        // Gentle floating motion
        rock.position.y =
          rocks[i].position[1] + Math.sin(t * 0.5 + i * 1.5) * 0.3;
      });
    }
  });

  return (
    <>
      {/* Stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#ffffff"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Floating rocks */}
      <group ref={rocksRef}>
        {rocks.map((rock, i) => (
          <mesh key={i} position={rock.position} scale={rock.scale}>
            {rock.type === 0 ? (
              <icosahedronGeometry args={[1, 0]} />
            ) : rock.type === 1 ? (
              <octahedronGeometry args={[1, 0]} />
            ) : (
              <tetrahedronGeometry args={[1, 0]} />
            )}
            <meshStandardMaterial
              color="#8a8a9a"
              metalness={0.9}
              roughness={0.3}
              emissive="#4a4a5a"
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}
