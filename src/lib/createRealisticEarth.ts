import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

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

export function createRealisticEarth(targetGroup: THREE.Group) {
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

  const earthGeometry = new THREE.SphereGeometry(2.1, 96, 96);
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
  targetGroup.add(earth);

  const loader = new OBJLoader();
  loader.load('/models/earth-photorealistic/earth.obj', (object) => {
    const modelMeshes: THREE.Mesh[] = [];
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        modelMeshes.push(child);
      }
    });

    if (modelMeshes.length === 0 || !targetGroup.children.includes(earth)) return;

    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const scale = 4.2 / Math.max(size.x, size.y, size.z, 1);

    targetGroup.remove(earth);
    earth.geometry.dispose();
    object.position.sub(center);
    object.scale.setScalar(scale);
    object.name = 'PhotorealisticEarthOBJ';

    modelMeshes.forEach((mesh) => {
      mesh.material = earthMaterial;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    });

    targetGroup.add(object);
  });

  const nightGeometry = new THREE.SphereGeometry(2.105, 96, 96);
  const nightMaterial = new THREE.MeshBasicMaterial({
    map: nightMap,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const nightLights = new THREE.Mesh(nightGeometry, nightMaterial);
  nightLights.name = 'RealisticEarthNightLights';
  targetGroup.add(nightLights);

  const cloudGeometry = new THREE.SphereGeometry(2.14, 96, 96);
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

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.018);
  ambientLight.name = 'RealisticEarthWeakAmbient';
  targetGroup.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 5.8);
  sunLight.name = 'RealisticEarthSunLight';
  sunLight.position.set(3.2, 2.2, 7.5);
  targetGroup.add(sunLight);

  return {
    earth,
    nightLights,
    clouds,
    ambientLight,
    sunLight,
    dispose: () => {
      disposeObject(targetGroup);
      targetGroup.clear();
    },
  };
}

