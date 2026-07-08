import { Component, Suspense, useEffect, useRef, type ErrorInfo, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import CameraController from './CameraController';
import GlassKnot from './GlassKnot';
import ParticlesField from './ParticlesField';
import FloatingGeometries from './FloatingGeometries';
import CinematicPostProcessing from './CinematicPostProcessing';

interface Scene3DProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
  }>;
}

function notifyPortfolioSceneReady() {
  document.documentElement.dataset.portfolioSceneReady = 'true';
  window.dispatchEvent(new CustomEvent('portfolio-scene-ready'));
}

class SceneAssetErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Failed to load 3D scene assets.', error, errorInfo);
    notifyPortfolioSceneReady();
  }

  render() {
    if (this.state.hasError) return null;

    return this.props.children;
  }
}

function CinematicSceneLights() {
  const ambientRef = useRef<THREE.AmbientLight>(null!);
  const keyLightRef = useRef<THREE.DirectionalLight>(null!);

  useEffect(() => {
    const handleReveal = () => {
      const ambient = ambientRef.current;
      const keyLight = keyLightRef.current;
      if (!ambient || !keyLight) return;

      keyLight.position.set(-10, 15, -5);

      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to(ambient, { intensity: 0.004, duration: 0.6 }, 0)
        .to(keyLight, { intensity: 2.2, duration: 0.85 }, 0);
    };

    window.addEventListener('portfolio-enter', handleReveal);
    return () => window.removeEventListener('portfolio-enter', handleReveal);
  }, []);

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.002} />
      <directionalLight ref={keyLightRef} position={[-10, 15, -5]} intensity={0} color="#eef5ff" />
    </>
  );
}

export default function Scene3D({ scrollProgress, mouseRef }: Scene3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 55, near: 0.1, far: 300 }}
      dpr={[1, 2]}
      frameloop="always"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        outputColorSpace: THREE.SRGBColorSpace,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    >
      <CameraController scrollProgress={scrollProgress} mouseRef={mouseRef} />

      <CinematicSceneLights />

      <ParticlesField mouseRef={mouseRef} />
      <SceneAssetErrorBoundary>
        <Suspense fallback={null}>
          <FloatingGeometries
            mouseRef={mouseRef}
            onReady={notifyPortfolioSceneReady}
          />
        </Suspense>
      </SceneAssetErrorBoundary>
      <GlassKnot scrollProgress={scrollProgress} mouseRef={mouseRef} />
      <CinematicPostProcessing />
    </Canvas>
  );
}

