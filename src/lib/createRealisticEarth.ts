import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const EARTH_RADIUS = 2.1;
const EARTH_SEGMENTS = 96;
const ATMOSPHERE_RADIUS = EARTH_RADIUS * 1.035;

const textureUrls = {
  diffuse: '/models/earth-photorealistic/textures/earth-color.webp',
  bump: '/models/earth-photorealistic/textures/earth-bump.webp',
  specular: '/models/earth-photorealistic/textures/earth-gloss.webp',
  clouds: '/models/earth-photorealistic/textures/earth-clouds-a.webp',
  night: '/models/earth-photorealistic/textures/earth-night.webp',
};

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }

  Object.values(material).forEach((value) => {
    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  });

  material.dispose();
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      disposeMaterial(child.material);
    }

    if (child instanceof THREE.Light) {
      child.dispose?.();
    }
  });
}

function createAtmosphereMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float fresnel = 1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0);
        float rim = smoothstep(0.58, 0.98, fresnel);
        float intensity = pow(rim, 1.7);
        vec3 glow = vec3(0.22, 0.58, 1.0) * intensity * 0.95;
        gl_FragColor = vec4(glow, intensity * 0.62);
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    toneMapped: false,
  });
}

export function createRealisticEarth(targetGroup: THREE.Group) {
  targetGroup.name = 'earthGroup';

  while (targetGroup.children.length > 0) {
    const child = targetGroup.children[0];
    targetGroup.remove(child);
    disposeObject(child);
  }

  const textureLoader = new THREE.TextureLoader();
  const diffuseMap = textureLoader.load(textureUrls.diffuse);
  const bumpMap = textureLoader.load(textureUrls.bump);
  const specularMap = textureLoader.load(textureUrls.specular);
  const cloudMap = textureLoader.load(textureUrls.clouds);
  const nightMap = textureLoader.load(textureUrls.night);

  diffuseMap.colorSpace = THREE.SRGBColorSpace;
  cloudMap.colorSpace = THREE.SRGBColorSpace;
  nightMap.colorSpace = THREE.SRGBColorSpace;

  [diffuseMap, bumpMap, specularMap, cloudMap, nightMap].forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 16;
  });

  const earthSurface = new THREE.Group();
  earthSurface.name = 'EarthSurfaceGroup';

  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, EARTH_SEGMENTS, EARTH_SEGMENTS);
  const earthMaterial = new THREE.MeshPhysicalMaterial({
    map: diffuseMap,
    bumpMap,
    bumpScale: 0.045,
    roughness: 0.54,
    metalness: 0.0,
    specularIntensity: 0.58,
    specularIntensityMap: specularMap,
    clearcoat: 0.12,
    clearcoatRoughness: 0.42,
  });

  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.name = 'RealisticEarthSurface';
  earthSurface.add(earth);

  const nightGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.002, EARTH_SEGMENTS, EARTH_SEGMENTS);
  const nightMaterial = new THREE.MeshBasicMaterial({
    map: nightMap,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const nightLights = new THREE.Mesh(nightGeometry, nightMaterial);
  nightLights.name = 'RealisticEarthNightLights';
  earthSurface.add(nightLights);
  targetGroup.add(earthSurface);

  const loader = new OBJLoader();
  let pendingObject: THREE.Object3D | null = null;
  let revealActive = false;

  const applyLoadedObject = (object: THREE.Object3D) => {
    const modelMeshes: THREE.Mesh[] = [];
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        modelMeshes.push(child);
      }
    });

    if (modelMeshes.length === 0 || !earthSurface.children.includes(earth)) return;

    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const scale = (EARTH_RADIUS * 2) / Math.max(size.x, size.y, size.z, 1);

    earthSurface.remove(earth);
    earth.geometry.dispose();
    object.position.sub(center);
    object.scale.setScalar(scale);
    object.name = 'PhotorealisticEarthOBJ';

    modelMeshes.forEach((mesh) => {
      mesh.material = earthMaterial;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    });

    earthSurface.add(object);
  };

  const handleRevealStart = () => {
    revealActive = true;
  };

  const handleRevealComplete = () => {
    revealActive = false;
    if (!pendingObject) return;
    const object = pendingObject;
    pendingObject = null;
    window.requestAnimationFrame(() => applyLoadedObject(object));
  };

  window.addEventListener('portfolio-enter', handleRevealStart);
  window.addEventListener('earth-cinematic-reveal-complete', handleRevealComplete);

  loader.load('/models/earth-photorealistic/earth.obj', (object) => {
    if (revealActive) {
      pendingObject = object;
      return;
    }

    applyLoadedObject(object);
  });

  const cloudGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.019, EARTH_SEGMENTS, EARTH_SEGMENTS);
  const cloudMaterial = new THREE.MeshStandardMaterial({
    map: cloudMap,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    roughness: 1.0,
    metalness: 0.0,
  });

  const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  clouds.name = 'RealisticEarthClouds';
  targetGroup.add(clouds);

  const atmosphereGeometry = new THREE.SphereGeometry(ATMOSPHERE_RADIUS, EARTH_SEGMENTS, EARTH_SEGMENTS);
  const atmosphere = new THREE.Mesh(atmosphereGeometry, createAtmosphereMaterial());
  atmosphere.name = 'RealisticEarthAtmosphereGlow';
  atmosphere.renderOrder = 2;
  targetGroup.add(atmosphere);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.01);
  ambientLight.name = 'RealisticEarthWeakAmbient';
  targetGroup.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 9.6);
  sunLight.name = 'RealisticEarthSunLight';
  sunLight.position.set(-12, 10, 5);
  targetGroup.add(sunLight);

  return {
    earth,
    earthSurface,
    atmosphere,
    nightLights,
    clouds,
    ambientLight,
    sunLight,
    dispose: () => {
      window.removeEventListener('portfolio-enter', handleRevealStart);
      window.removeEventListener('earth-cinematic-reveal-complete', handleRevealComplete);
      disposeObject(targetGroup);
      targetGroup.clear();
    },
  };
}
