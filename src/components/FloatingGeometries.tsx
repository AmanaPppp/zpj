import { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

interface FloatingGeometriesProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number; targetX: number; targetY: number }>;
}

type FloatingAsteroid = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  speed: number;
  phase: number;
  modelIndex: number;
};

type AsteroidModel = {
  geometry: THREE.BufferGeometry;
  material: THREE.MeshStandardMaterial;
  scaleBias: number;
};

const ASTEROID_IDS = [1, 2, 3, 4, 8];
const MODEL_ROOT = '/models/asteroids-pbr';

function normalizeGeometry(sourceGeometry: THREE.BufferGeometry) {
  const geometry = sourceGeometry.clone();
  geometry.computeBoundingBox();

  const box = geometry.boundingBox;
  if (!box) return geometry;

  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const scale = 1 / Math.max(size.x, size.y, size.z, 1);
  geometry.translate(-center.x, -center.y, -center.z);
  geometry.scale(scale, scale, scale);
  geometry.computeVertexNormals();

  return geometry;
}

function mergeObjectGeometry(object: THREE.Object3D) {
  let selectedGeometry: THREE.BufferGeometry | null = null;
  let largestVolume = -Infinity;

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !child.geometry) return;

    child.geometry.computeBoundingBox();
    const box = child.geometry.boundingBox;
    if (!box) return;

    const size = new THREE.Vector3();
    box.getSize(size);
    const volume = size.x * size.y * size.z;
    if (volume > largestVolume) {
      largestVolume = volume;
      selectedGeometry = child.geometry;
    }
  });

  return selectedGeometry ? normalizeGeometry(selectedGeometry) : new THREE.IcosahedronGeometry(1, 5);
}

function createAsteroidMaterial(id: number, textureLoader: THREE.TextureLoader) {
  const textureRoot = `${MODEL_ROOT}/asteroid${id}/textures`;
  const colorMap = textureLoader.load(`${textureRoot}/base.webp`);
  const normalMap = textureLoader.load(`${textureRoot}/normal.webp`);
  const roughnessMap = textureLoader.load(`${textureRoot}/roughness.webp`);
  const aoMap = textureLoader.load(`${textureRoot}/ao.webp`);

  colorMap.colorSpace = THREE.SRGBColorSpace;
  [colorMap, normalMap, roughnessMap, aoMap].forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
  });

  return new THREE.MeshStandardMaterial({
    map: colorMap,
    normalMap,
    normalScale: new THREE.Vector2(1.15, 1.15),
    roughnessMap,
    aoMap,
    color: '#d6d6d6',
    roughness: 0.88,
    metalness: 0.015,
    emissive: '#07080b',
    emissiveIntensity: 0.045,
  });
}

const INTERACTIVE_START = 0.58;

export default function FloatingGeometries({ scrollProgress, mouseRef }: FloatingGeometriesProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const objects = useLoader(OBJLoader, ASTEROID_IDS.map((id) => `${MODEL_ROOT}/asteroid${id}/model.obj`));

  const asteroidModels = useMemo<AsteroidModel[]>(() => {
    const textureLoader = new THREE.TextureLoader();
    const scaleBiases = [1.18, 1.48, 1.25, 1.7, 1.55];

    return objects.map((object, index) => {
      const id = ASTEROID_IDS[index];
      return {
        geometry: mergeObjectGeometry(object),
        material: createAsteroidMaterial(id, textureLoader),
        scaleBias: scaleBiases[index] ?? 1,
      };
    });
  }, [objects]);

  const asteroids = useMemo(() => {
    const items: FloatingAsteroid[] = [];
    const count = 34;
    const modelCount = Math.max(asteroidModels.length, 1);

    for (let i = 0; i < count; i += 1) {
      const modelIndex = i % modelCount;
      const modelScaleBias = asteroidModels[modelIndex]?.scaleBias ?? 1;
      const angle = Math.random() * Math.PI * 2;
      const layer = i % 4;
      const layerY = [-24, -8, 10, 26][layer];
      const radius = 13 + Math.random() * 38;
      const zDepth = layer < 2 ? -8 - Math.random() * 30 : -16 - Math.random() * 38;
      const sizeTier = i % 10;
      const baseScale =
        (sizeTier === 0
          ? 3.4 + Math.random() * 1.8
          : sizeTier < 3
            ? 1.45 + Math.random() * 1.15
            : 0.48 + Math.random() * 0.82) * modelScaleBias;
      const elongation = 0.78 + Math.random() * 0.55;

      items.push({
        position: [
          Math.cos(angle) * radius,
          layerY + (Math.random() - 0.5) * 15,
          zDepth,
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        scale: [
          baseScale * (0.82 + Math.random() * 0.35),
          baseScale * elongation,
          baseScale * (0.82 + Math.random() * 0.42),
        ],
        speed: 0.13 + Math.random() * 0.32,
        phase: Math.random() * Math.PI * 2,
        modelIndex,
      });
    }

    return items;
  }, [asteroidModels]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const interactive = scrollProgress.current >= INTERACTIVE_START;
    groupRef.current.visible = interactive;
    if (!interactive) return;

    const time = state.clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      const asteroid = asteroids[i];
      if (!asteroid) return;

      const orbitAngle = time * asteroid.speed * 0.18 + asteroid.phase;
      const orbitRadius = Math.sqrt(asteroid.position[0] ** 2 + asteroid.position[1] ** 2) * 0.1;
      const driftX =
        Math.sin(time * asteroid.speed + asteroid.phase) * 4.8 + Math.cos(orbitAngle) * orbitRadius;
      const driftY =
        Math.cos(time * asteroid.speed * 0.9 + asteroid.phase) * 4.4 + Math.sin(orbitAngle) * orbitRadius;
      const driftZ = Math.sin(time * asteroid.speed * 0.72 + asteroid.phase) * 6.8;

      child.position.x = asteroid.position[0] + driftX + mouseRef.current.x * 1.2;
      child.position.y = asteroid.position[1] + driftY + mouseRef.current.y * 0.9;
      child.position.z = asteroid.position[2] + driftZ;

      child.rotation.x = asteroid.rotation[0] + time * asteroid.speed * 0.78 + Math.sin(time * 0.35 + asteroid.phase) * 0.42;
      child.rotation.y = asteroid.rotation[1] + time * asteroid.speed * 1.02 + Math.cos(time * 0.28 + asteroid.phase) * 0.42;
      child.rotation.z = asteroid.rotation[2] + time * asteroid.speed * 0.62 + asteroid.phase;
    });
  });

  if (asteroidModels.length === 0) return null;

  return (
    <group ref={groupRef}>
      {asteroids.map((asteroid, i) => {
        const model = asteroidModels[asteroid.modelIndex] ?? asteroidModels[0];

        return (
          <mesh
            key={i}
            geometry={model.geometry}
            material={model.material}
            scale={asteroid.scale}
            position={asteroid.position}
            rotation={asteroid.rotation}
          />
        );
      })}
    </group>
  );
}
