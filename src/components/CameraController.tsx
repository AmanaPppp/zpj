import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface CameraControllerProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
  }>;
}

export default function CameraController({
  scrollProgress,
  mouseRef,
}: CameraControllerProps) {
  const { camera } = useThree();

  // Base position: scroll-driven (orbital A)
  const basePosition = useRef(new THREE.Vector3(0, 0, 0));
  // Offset: mouse-driven (orbital B)
  const offset = useRef(new THREE.Vector3(0, 0, 0));
  // Current lookAt target
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  // Current smoothed lookAt for interpolation
  const smoothedLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const introActive = useRef(true);

  // Camera initial position
  useEffect(() => {
    camera.position.set(0, 0, 58);
    camera.lookAt(0, 0, 0);
    smoothedLookAt.current.set(0, 0, 0);

    const handleEnter = () => {
      gsap.to(camera.position, {
        z: 5,
        duration: 1.65,
        ease: 'power4.inOut',
        onUpdate: () => {
          camera.up.set(0, 1, 0);
          camera.lookAt(0, 0, 0);
        },
        onComplete: () => {
          introActive.current = false;
          camera.position.set(0, 0, 5);
          camera.up.set(0, 1, 0);
          smoothedLookAt.current.set(0, 0, 0);
          window.dispatchEvent(new CustomEvent('earth-hero-visible'));
        },
      });
    };

    window.addEventListener('portfolio-enter', handleEnter);
    return () => window.removeEventListener('portfolio-enter', handleEnter);
  }, [camera]);

  useFrame((_state, delta) => {
    const scroll = scrollProgress.current;
    const dt = Math.min(delta, 0.05);

    // ===== Orbital A: Scroll-driven base position =====
    // Z: 5 -> 10 (moderate pull back / zoom out)
    const targetZ = THREE.MathUtils.lerp(5, 10, scroll);
    // Y: 0 -> -5 (camera sinks deep, model flies upward dramatically)
    const targetY = THREE.MathUtils.lerp(0, -5, scroll);
    // X: 0 (no scroll-driven horizontal movement)
    const targetBaseX = 0;

    basePosition.current.set(targetBaseX, targetY, targetZ);

    // ===== Orbital B: Mouse parallax offset =====
    // Much stronger mouse influence
    const parallaxStrength = 1.2;
    const targetOffsetX = mouseRef.current.targetX * parallaxStrength;
    const targetOffsetY = mouseRef.current.targetY * parallaxStrength;

    // Lerp damping for smooth, floating feel
    const lerpFactor = 1 - Math.pow(0.02, dt);

    offset.current.x = THREE.MathUtils.lerp(
      offset.current.x,
      targetOffsetX,
      lerpFactor
    );
    offset.current.y = THREE.MathUtils.lerp(
      offset.current.y,
      targetOffsetY,
      lerpFactor
    );

    // ===== Final camera position: base + offset =====
    const finalX = basePosition.current.x + offset.current.x;
    const finalY = basePosition.current.y + offset.current.y;
    const finalZ = basePosition.current.z;

    if (introActive.current) {
      camera.lookAt(0, 0, 0);
      return;
    }

    // Smoothly move camera to final position
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      finalX,
      lerpFactor
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      finalY,
      lerpFactor
    );
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      finalZ,
      lerpFactor
    );

    // ===== LookAt target =====
    // Start at center, look much higher as scroll progresses
    const targetLookY = THREE.MathUtils.lerp(0, 3.5, scroll);
    lookAtTarget.current.set(0, targetLookY, 0);

    // Smooth lookAt interpolation
    smoothedLookAt.current.x = THREE.MathUtils.lerp(
      smoothedLookAt.current.x,
      lookAtTarget.current.x,
      lerpFactor
    );
    smoothedLookAt.current.y = THREE.MathUtils.lerp(
      smoothedLookAt.current.y,
      lookAtTarget.current.y,
      lerpFactor
    );
    smoothedLookAt.current.z = THREE.MathUtils.lerp(
      smoothedLookAt.current.z,
      lookAtTarget.current.z,
      lerpFactor
    );

    camera.lookAt(smoothedLookAt.current);
  });

  return null;
}
