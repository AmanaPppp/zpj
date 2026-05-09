import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const lightPosition = new THREE.Vector3(0, 100, 0);
const targetPosition = new THREE.Vector3(0, 20, -18);

export default function PhysicalSpotlight() {
  const lightRef = useRef<THREE.SpotLight>(null!);
  const targetRef = useRef<THREE.Object3D>(null!);

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
      lightRef.current.shadow.mapSize.set(1024, 1024);
      lightRef.current.shadow.camera.near = 1;
      lightRef.current.shadow.camera.far = 160;
      lightRef.current.shadow.bias = -0.0001;
    }
  }, []);

  return (
    <>
      <object3D ref={targetRef} position={targetPosition} />
      <spotLight
        ref={lightRef}
        position={lightPosition}
        color="#ffffff"
        intensity={80000}
        angle={Math.PI / 4}
        penumbra={0.85}
        decay={2}
        distance={150}
        castShadow
      />
    </>
  );
}
