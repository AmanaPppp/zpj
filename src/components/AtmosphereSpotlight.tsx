import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const spotlightPosition = new THREE.Vector3(0, 34, -26);
const spotlightTarget = new THREE.Vector3(0, -52, -42);

export default function AtmosphereSpotlight() {
  const lightRef = useRef<THREE.SpotLight>(null!);
  const targetRef = useRef<THREE.Object3D>(null!);

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const lightX = Math.sin(time * 0.1) * 1.4;
    const targetX = Math.sin(time * 0.08) * 0.8;

    if (lightRef.current) {
      lightRef.current.position.set(lightX, spotlightPosition.y, spotlightPosition.z);
      lightRef.current.intensity = 760 + Math.sin(time * 0.35) * 28;
    }

    if (targetRef.current) {
      targetRef.current.position.set(targetX, spotlightTarget.y, spotlightTarget.z);
    }
  });

  return (
    <>
      <object3D ref={targetRef} position={spotlightTarget} />
      <spotLight
        ref={lightRef}
        position={spotlightPosition}
        color="#f2f7ff"
        intensity={1050}
        angle={Math.PI / 4.35}
        penumbra={0.9}
        decay={2}
        distance={138}
      />
    </>
  );
}
