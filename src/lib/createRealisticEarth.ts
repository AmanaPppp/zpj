import * as THREE from 'three';

const textureUrls = {
  diffuse: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  bump: 'https://threejs.org/examples/textures/planets/earth_bump_2048.jpg',
  specular: 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
  clouds: 'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
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

  diffuseMap.colorSpace = THREE.SRGBColorSpace;
  cloudMap.colorSpace = THREE.SRGBColorSpace;

  const earthGeometry = new THREE.SphereGeometry(2.1, 96, 96);
  const earthMaterial = new THREE.MeshPhysicalMaterial({
    map: diffuseMap,
    bumpMap,
    bumpScale: 0.08,
    roughness: 0.62,
    metalness: 0.0,
    specularIntensity: 0.85,
    specularIntensityMap: specularMap,
    clearcoat: 0.18,
    clearcoatRoughness: 0.42,
  });

  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.name = 'RealisticEarthSurface';
  targetGroup.add(earth);

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
    clouds,
    ambientLight,
    sunLight,
    dispose: () => {
      disposeObject(targetGroup);
      targetGroup.clear();
    },
  };
}
