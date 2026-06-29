import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { createRealisticEarth } from '../lib/createRealisticEarth';
import { cinematicRevealState } from '../lib/cinematicRevealState';
import {
  CINEMATIC_DURATION,
  HERO_CAMERA,
  HERO_EARTH_ROT_X,
  HERO_EARTH_ROT_Z,
  HERO_EARTH_SCALE,
  HERO_EARTH_X,
  HERO_EARTH_Y,
  HERO_FOV,
  HERO_LOOK_AT,
  REVEAL_AMBIENT_INTENSITY,
  REVEAL_LIGHT_INTENSITY,
  REVEAL_LIGHT_POSITION,
  START_CAMERA,
  START_EARTH_SCALE,
  START_EARTH_X,
  START_EARTH_Y,
  START_FOV,
  START_LOOK_AT,
  applyCinematicRevealMotion,
  smoothStep,
} from '../lib/cinematicRevealMotion';

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

export default function GlassKnot({ scrollProgress, mouseRef }: GlassKnotProps) {
  const { camera } = useThree();
  const earthGroupRef = useRef<THREE.Group>(null!);
  const earthSurfaceRef = useRef<THREE.Group | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const cloudOffsetY = useRef(0);
  const rotationY = useRef(0);
  const revealRotationOffset = useRef({ y: 0 });
  const revealLookAt = useRef({ x: 0, y: HERO_EARTH_Y, z: 0 });
  const revealTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const revealFrameRef = useRef<(() => void) | null>(null);
  const revealProgressRef = useRef({ value: 0 });
  const initialBodyOverflowRef = useRef('');
  const revealPlayingRef = useRef(false);
  const introStartedRef = useRef(false);

  useEffect(() => {
    if (!earthGroupRef.current) return;

    const earth = createRealisticEarth(earthGroupRef.current);
    earthSurfaceRef.current = earth.earthSurface;
    cloudsRef.current = earth.clouds;
    ambientLightRef.current = earth.ambientLight;
    sunLightRef.current = earth.sunLight;

    initialBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    earth.ambientLight.intensity = 0.01;
    earth.sunLight.intensity = 0;
    earth.sunLight.position.copy(REVEAL_LIGHT_POSITION);

    function playCinematicReveal() {
      const earthGroup = earthGroupRef.current;
      const ambientLight = ambientLightRef.current;
      const sunLight = sunLightRef.current;
      if (!earthGroup || !ambientLight || !sunLight) return;
      const perspectiveCamera = camera instanceof THREE.PerspectiveCamera ? camera : null;
      const cameraTarget = new THREE.Vector3();
      const applyRevealFrame = () => {
        const { easedProgress } = applyCinematicRevealMotion({
          progress: revealProgressRef.current.value,
          camera,
          cameraTarget,
          earthGroup,
          perspectiveCamera,
        });

        revealLookAt.current.x = cameraTarget.x;
        revealLookAt.current.y = cameraTarget.y;
        revealLookAt.current.z = cameraTarget.z;
        cinematicRevealState.active = true;
        cinematicRevealState.progress = revealProgressRef.current.value;
        cinematicRevealState.easedProgress = easedProgress;
        cinematicRevealState.velocity = Math.max(0, 1 - easedProgress);
      };
      revealFrameRef.current = applyRevealFrame;

      revealTimelineRef.current?.kill();
      revealProgressRef.current.value = 0;
      cinematicRevealState.active = true;
      cinematicRevealState.progress = 0;
      cinematicRevealState.easedProgress = 0;
      cinematicRevealState.velocity = 1;
      document.body.style.overflow = 'hidden';

      camera.position.copy(START_CAMERA);
      camera.up.set(0, 1, 0);
      if (perspectiveCamera) {
        perspectiveCamera.fov = START_FOV;
        perspectiveCamera.updateProjectionMatrix();
      }
      revealLookAt.current.x = START_LOOK_AT.x;
      revealLookAt.current.y = START_LOOK_AT.y;
      revealLookAt.current.z = START_LOOK_AT.z;
      cameraTarget.copy(START_LOOK_AT);
      ambientLight.intensity = 0.01;
      sunLight.intensity = 0;
      sunLight.position.copy(REVEAL_LIGHT_POSITION);
      revealRotationOffset.current.y = 0;
      revealPlayingRef.current = true;
      introStartedRef.current = true;
      earthGroup.position.x = START_EARTH_X;
      earthGroup.position.y = START_EARTH_Y;
      earthGroup.scale.setScalar(START_EARTH_SCALE);
      earthGroup.rotation.x = -0.18;
      earthGroup.rotation.y = -0.88;
      earthGroup.rotation.z = -0.04;
      applyRevealFrame();

      const timeline = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          document.body.style.overflow = initialBodyOverflowRef.current || '';
          camera.position.copy(HERO_CAMERA);
          if (perspectiveCamera) {
            perspectiveCamera.fov = HERO_FOV;
            perspectiveCamera.updateProjectionMatrix();
          }
          camera.lookAt(HERO_LOOK_AT);
          earthGroup.scale.setScalar(HERO_EARTH_SCALE);
          earthGroup.position.x = HERO_EARTH_X;
          earthGroup.position.y = HERO_EARTH_Y;
          earthGroup.rotation.x = HERO_EARTH_ROT_X;
          earthGroup.rotation.z = HERO_EARTH_ROT_Z;
          revealRotationOffset.current.y = earthGroup.rotation.y;
          revealPlayingRef.current = false;
          revealFrameRef.current = null;
          revealTimelineRef.current = null;
          cinematicRevealState.active = false;
          cinematicRevealState.progress = 1;
          cinematicRevealState.easedProgress = 1;
          cinematicRevealState.velocity = 0;
          window.dispatchEvent(new CustomEvent('earth-cinematic-reveal-complete'));
        },
      });
      revealTimelineRef.current = timeline;

      timeline
        .to(ambientLight, {
          intensity: REVEAL_AMBIENT_INTENSITY,
          duration: 0.7,
        }, 0)
        .to(sunLight, {
          intensity: REVEAL_LIGHT_INTENSITY,
          duration: 0.9,
        }, 0)
        .to(revealProgressRef.current, {
          value: 1,
          duration: CINEMATIC_DURATION,
          ease: 'none',
        }, 0);
    }

    window.addEventListener('portfolio-enter', playCinematicReveal);

    return () => {
      window.removeEventListener('portfolio-enter', playCinematicReveal);
      revealTimelineRef.current?.kill();
      revealFrameRef.current = null;
      revealPlayingRef.current = false;
      introStartedRef.current = false;
      document.body.style.overflow = initialBodyOverflowRef.current || '';
      earth.dispose();
    };
  }, [camera]);

  useFrame((_state, delta) => {
    if (!earthGroupRef.current) return;

    const transitionProgress = smoothStep(scrollProgress.current / SECOND_SECTION_START);
    const interactionProgress = smoothStep((scrollProgress.current - SECOND_SECTION_START) / (1 - SECOND_SECTION_START));
    if (introStartedRef.current) {
      rotationY.current += delta * 0.09;
    }

    if (revealPlayingRef.current) {
      revealFrameRef.current?.();
    }

    const targetRotX = THREE.MathUtils.lerp(HERO_EARTH_ROT_X, 0, transitionProgress) + mouseRef.current.targetY * 0.11 * interactionProgress;
    const targetRotY = revealRotationOffset.current.y + mouseRef.current.targetX * 0.08 * interactionProgress;
    const targetRotZ = THREE.MathUtils.lerp(HERO_EARTH_ROT_Z, 0, transitionProgress) - mouseRef.current.targetX * 0.05 * interactionProgress;
    const targetScale = THREE.MathUtils.lerp(HERO_EARTH_SCALE, 0.86, transitionProgress);
    const targetY = THREE.MathUtils.lerp(HERO_EARTH_Y, 0, transitionProgress);
    const targetX = THREE.MathUtils.lerp(HERO_EARTH_X, 0, transitionProgress);

    if (!revealPlayingRef.current) {
      earthGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(earthGroupRef.current.scale.x, targetScale, delta * 3));
      earthGroupRef.current.position.x = THREE.MathUtils.lerp(earthGroupRef.current.position.x, targetX, delta * 3);
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
    }

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

  return <group ref={earthGroupRef} name="earthGroup" position={[HERO_EARTH_X, HERO_EARTH_Y, 0]} scale={HERO_EARTH_SCALE} />;
}
