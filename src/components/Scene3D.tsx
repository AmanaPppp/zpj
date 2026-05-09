import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import CameraController from './CameraController';
import GlassKnot from './GlassKnot';
import ParticlesField from './ParticlesField';
import FloatingGeometries from './FloatingGeometries';

interface Scene3DProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
  }>;
}

export default function Scene3D({ scrollProgress, mouseRef }: Scene3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 55, near: 0.1, far: 300 }}
      dpr={[1, 2]}
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

      <ambientLight intensity={0.12} />
      <directionalLight position={[8, 5, 6]} intensity={0.24} color="#dce8ff" />
      <directionalLight position={[-6, -4, -8]} intensity={0.14} color="#526dff" />
      <pointLight position={[0, -1, 0]} intensity={0.65} color="#5c6bc0" distance={20} decay={2} />

      <ParticlesField mouseRef={mouseRef} />
      <FloatingGeometries mouseRef={mouseRef} />
      <GlassKnot mouseRef={mouseRef} />
    </Canvas>
  );
}
