import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingGeometriesProps {
  mouseRef: React.MutableRefObject<{ x: number; y: number; targetX: number; targetY: number }>;
}

type FloatingAsteroid = {
  position: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
  modelIndex: number;
  material: THREE.MeshStandardMaterial;
};

type AsteroidModel = {
  geometry: THREE.BufferGeometry;
  material: THREE.MeshStandardMaterial;
};

function hashNoise(x: number, y: number, seed: number) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function layeredNoise(x: number, y: number, seed: number) {
  let value = 0;
  let amplitude = 0.55;
  let frequency = 1;

  for (let i = 0; i < 5; i++) {
    value += hashNoise(x * frequency, y * frequency, seed + i * 13.7) * amplitude;
    amplitude *= 0.52;
    frequency *= 2.15;
  }

  return value;
}

function createAsteroidTexture(seed: number, size = 256) {
  const colorCanvas = document.createElement('canvas');
  const bumpCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  bumpCanvas.width = size;
  bumpCanvas.height = size;

  const colorCtx = colorCanvas.getContext('2d')!;
  const bumpCtx = bumpCanvas.getContext('2d')!;
  const colorData = colorCtx.createImageData(size, size);
  const bumpData = bumpCtx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;
      const stone = layeredNoise(nx * 9.0, ny * 9.0, seed);
      const grain = layeredNoise(nx * 34.0, ny * 34.0, seed + 41);
      const crater = Math.pow(1 - Math.abs(layeredNoise(nx * 5.0, ny * 5.0, seed + 93) - 0.54) * 3.2, 4);
      const height = THREE.MathUtils.clamp(stone * 0.72 + grain * 0.28 - crater * 0.42, 0, 1);

      const warmth = layeredNoise(nx * 4.0, ny * 4.0, seed + 7);
      const base = 42 + height * 82;
      const r = base + warmth * 18;
      const g = base * 0.95 + warmth * 10;
      const b = base * 0.9 + grain * 12;
      const index = (y * size + x) * 4;

      colorData.data[index] = r;
      colorData.data[index + 1] = g;
      colorData.data[index + 2] = b;
      colorData.data[index + 3] = 255;

      const bump = THREE.MathUtils.clamp(height * 255, 0, 255);
      bumpData.data[index] = bump;
      bumpData.data[index + 1] = bump;
      bumpData.data[index + 2] = bump;
      bumpData.data[index + 3] = 255;
    }
  }

  colorCtx.putImageData(colorData, 0, 0);
  bumpCtx.putImageData(bumpData, 0, 0);

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.anisotropy = 8;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.colorSpace = THREE.NoColorSpace;
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.anisotropy = 8;

  return { colorMap, bumpMap };
}

function createAsteroidGeometry(seed: number) {
  const geometry = new THREE.IcosahedronGeometry(1, 4);
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const normal = vertex.clone().normalize();

    const largeForm =
      Math.sin(normal.x * 3.6 + seed * 1.7) * 0.13 +
      Math.cos(normal.y * 4.1 + seed * 2.1) * 0.11 +
      Math.sin(normal.z * 4.9 + seed * 0.8) * 0.09;

    const pits =
      Math.pow(Math.max(0, Math.sin(normal.x * 13.0 + seed) * Math.cos(normal.y * 11.0 - seed)), 3) *
      0.16;

    const fineRock =
      Math.sin((normal.x + normal.y) * 25.0 + seed * 5.0) * 0.025 +
      Math.cos((normal.y + normal.z) * 22.0 + seed * 3.0) * 0.025;

    const radius = 1.0 + largeForm + fineRock - pits;
    vertex.copy(normal.multiplyScalar(radius));
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

function createAsteroidModel(seed: number): AsteroidModel {
  const { colorMap, bumpMap } = createAsteroidTexture(seed);

  return {
    geometry: createAsteroidGeometry(seed),
    material: new THREE.MeshStandardMaterial({
      map: colorMap,
      bumpMap,
      bumpScale: 0.24,
      color: '#8a8178',
      roughness: 0.96,
      metalness: 0.02,
      emissive: '#10131a',
      emissiveIntensity: 0.035,
    }),
  };
}

function createAsteroidTint() {
  const hues = [18, 24, 30, 36, 210, 220];
  const hue = hues[Math.floor(Math.random() * hues.length)] + (Math.random() - 0.5) * 8;
  const saturation = 6 + Math.random() * 14;
  const lightness = 38 + Math.random() * 20;

  return new THREE.Color().setHSL(hue / 360, saturation / 100, lightness / 100).getStyle();
}

function createTintedAsteroidMaterial(model: AsteroidModel) {
  const material = model.material.clone();
  material.color = new THREE.Color(createAsteroidTint());
  material.emissive = new THREE.Color('#10131a');
  material.needsUpdate = true;
  return material;
}

export default function FloatingGeometries({ mouseRef }: FloatingGeometriesProps) {
  const groupRef = useRef<THREE.Group>(null!);

  const asteroidModels = useMemo(
    () => Array.from({ length: 7 }, (_, index) => createAsteroidModel(index + 1)),
    []
  );

  const asteroids = useMemo(() => {
    const items: FloatingAsteroid[] = [];

    for (let i = 0; i < 42; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 22 + Math.random() * 56;
      const layer = i % 4;
      const layerY = [-34, -12, 12, 34][layer];
      const yOffset = layerY + (Math.random() - 0.5) * 18;
      const zDepth = layer < 2 ? -18 - Math.random() * 44 : -28 - Math.random() * 56;
      const modelIndex = Math.floor(Math.random() * asteroidModels.length);

      items.push({
        position: [Math.cos(angle) * radius, yOffset, zDepth],
        scale: 0.24 + Math.random() * 1.16,
        speed: 0.18 + Math.random() * 0.36,
        phase: Math.random() * Math.PI * 2,
        modelIndex,
        material: createTintedAsteroidMaterial(asteroidModels[modelIndex]),
      });
    }

    return items;
  }, [asteroidModels.length]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      const asteroid = asteroids[i];
      if (!asteroid) return;

      const orbitAngle = time * asteroid.speed * 0.18 + asteroid.phase;
      const orbitRadius = Math.sqrt(asteroid.position[0] ** 2 + asteroid.position[1] ** 2) * 0.1;
      const driftX =
        Math.sin(time * asteroid.speed + asteroid.phase) * 5.8 + Math.cos(orbitAngle) * orbitRadius;
      const driftY =
        Math.cos(time * asteroid.speed * 0.9 + asteroid.phase) * 5.4 + Math.sin(orbitAngle) * orbitRadius;
      const driftZ = Math.sin(time * asteroid.speed * 0.72 + asteroid.phase) * 8.6;

      child.position.x = asteroid.position[0] + driftX + mouseRef.current.x * 1.2;
      child.position.y = asteroid.position[1] + driftY + mouseRef.current.y * 0.9;
      child.position.z = asteroid.position[2] + driftZ;

      child.rotation.x = time * asteroid.speed * 0.85 + Math.sin(time * 0.35 + asteroid.phase) * 0.5;
      child.rotation.y = time * asteroid.speed * 1.1 + Math.cos(time * 0.28 + asteroid.phase) * 0.45;
      child.rotation.z = time * asteroid.speed * 0.65 + asteroid.phase;
    });
  });

  return (
    <group ref={groupRef}>
      {asteroids.map((asteroid, i) => {
        const model = asteroidModels[asteroid.modelIndex];

        return (
          <mesh
            key={i}
            geometry={model.geometry}
            material={asteroid.material}
            scale={asteroid.scale}
            position={asteroid.position}
          />
        );
      })}
    </group>
  );
}
