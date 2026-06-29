import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControllerProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
  }>;
}

const SECOND_SECTION_START = 0.58;
const START_CAMERA = new THREE.Vector3(-1.58, 1.02, 5.55);
const START_LOOK_AT = new THREE.Vector3(-0.48, 1.06, 0);
const HERO_CAMERA = new THREE.Vector3(0, 0.42, 9.9);
const HERO_LOOK_AT = new THREE.Vector3(-0.44, 0.98, 0);
const SECTION_CAMERA = new THREE.Vector3(0, 0.08, 5.45);
const SECTION_LOOK_AT = new THREE.Vector3(0, 0, 0);

const smoothStep = (value: number) => {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

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
    camera.position.copy(START_CAMERA);
    camera.lookAt(START_LOOK_AT);
    smoothedLookAt.current.copy(START_LOOK_AT);

    let heroTextTimer = 0;

    const handleEnter = () => {
      window.clearTimeout(heroTextTimer);
      heroTextTimer = window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('earth-hero-visible'));
      }, 260);
    };

    const handleRevealComplete = () => {
      introActive.current = false;
      camera.position.copy(HERO_CAMERA);
      camera.up.set(0, 1, 0);
      smoothedLookAt.current.copy(HERO_LOOK_AT);
      camera.lookAt(HERO_LOOK_AT);
    };

    window.addEventListener('portfolio-enter', handleEnter);
    window.addEventListener('earth-cinematic-reveal-complete', handleRevealComplete);

    return () => {
      window.clearTimeout(heroTextTimer);
      window.removeEventListener('portfolio-enter', handleEnter);
      window.removeEventListener('earth-cinematic-reveal-complete', handleRevealComplete);
    };
  }, [camera]);

  useFrame((_state, delta) => {
    const transitionProgress = smoothStep(scrollProgress.current / SECOND_SECTION_START);
    const interactionProgress = smoothStep((scrollProgress.current - SECOND_SECTION_START) / (1 - SECOND_SECTION_START));
    const dt = Math.min(delta, 0.05);

    // ===== Orbital A: Scroll-driven base position =====
    // Hero starts as a high-angle close pass, then settles into the second-section full Earth view.
    const targetBaseX = THREE.MathUtils.lerp(HERO_CAMERA.x, SECTION_CAMERA.x, transitionProgress);
    const targetY = THREE.MathUtils.lerp(HERO_CAMERA.y, SECTION_CAMERA.y, transitionProgress);
    const targetZ = THREE.MathUtils.lerp(HERO_CAMERA.z, SECTION_CAMERA.z, transitionProgress);

    basePosition.current.set(targetBaseX, targetY, targetZ);

    // ===== Orbital B: Mouse parallax offset =====
    // Disabled for the hero close-up; fades in once the second section is reached.
    const parallaxStrength = 0.85 * interactionProgress;
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
    lookAtTarget.current.set(
      THREE.MathUtils.lerp(HERO_LOOK_AT.x, SECTION_LOOK_AT.x, transitionProgress),
      THREE.MathUtils.lerp(HERO_LOOK_AT.y, SECTION_LOOK_AT.y, transitionProgress),
      THREE.MathUtils.lerp(HERO_LOOK_AT.z, SECTION_LOOK_AT.z, transitionProgress),
    );

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
