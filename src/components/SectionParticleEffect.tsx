import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const PARTICLE_COUNT = 40000;
const SOURCE_IMAGE = '/particle-default-source.png';

const vertexShader = `
  uniform float uTime;
  uniform float uPointSize;
  uniform float uMorph;
  uniform float uExplode;
  attribute vec3 targetPosition;
  attribute vec3 explodePosition;
  attribute vec3 randomOffset;
  varying vec3 vColor;
  varying float vDistance;
  varying float vExplode;

  void main() {
    vec3 gathered = mix(position, targetPosition, uMorph);
    vec3 pos = mix(gathered, explodePosition, uExplode);
    float drift = sin(uTime * 1.5 + pos.x * 0.3) * cos(uTime * 1.2 + pos.y * 0.24);
    float driftAmount = mix(0.24, 0.42, uExplode);
    pos += normalize(pos + randomOffset * 0.35) * drift * driftAmount;
    pos.x += sin(uTime * 0.34 + randomOffset.z * 6.0) * mix(0.18, 0.72, uExplode);
    pos.y += cos(uTime * 0.28 + randomOffset.x * 6.0) * mix(0.14, 0.58, uExplode);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float dist = length(pos);
    vDistance = dist;
    vExplode = uExplode;
    vColor = vec3(1.0);
    gl_PointSize = (uPointSize / -mvPosition.z) * (1.2 + sin(uTime * 3.0 + dist * 0.15) * 0.5) * mix(1.0, 0.72, uExplode);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec3 vColor;
  varying float vDistance;
  varying float vExplode;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    float strength = pow(1.0 - dist * 2.0, 1.6);
    float alpha = strength * (0.8 + sin(vDistance * 0.3 + uTime) * 0.2) * mix(1.0, 0.24, vExplode);
    gl_FragColor = vec4(vColor * 2.0, alpha);
  }
`;

interface SectionParticleEffectProps {
  mode: 'idle' | 'active' | 'explode' | 'hidden';
  sourceImage?: string;
  className?: string;
  pointSize?: number;
  explodeSpeed?: number;
  morphSpeed?: number;
}

export default function SectionParticleEffect({
  mode,
  sourceImage = SOURCE_IMAGE,
  className = '',
  pointSize = 97,
  explodeSpeed = 0.045,
  morphSpeed = 0.035,
}: SectionParticleEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
    camera.position.z = 45;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const explodePositions = new Float32Array(PARTICLE_COUNT * 3);
    const randomOffsets = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const i3 = i * 3;
      const t = (Math.random() - 0.5) * 5;
      const angle = Math.random() * Math.PI * 2;
      const radiusBase = 0.4 + Math.abs(t) ** 2.4;
      const radius = radiusBase * (0.78 + Math.random() * 0.55);
      const x = radius * Math.cos(angle) * 2.9;
      const z = radius * Math.sin(angle) * 2.9;
      const y = t * 7.5;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      targetPositions[i3] = x;
      targetPositions[i3 + 1] = y;
      targetPositions[i3 + 2] = z;
      explodePositions[i3] = x;
      explodePositions[i3 + 1] = y;
      explodePositions[i3 + 2] = z;
      randomOffsets[i3] = (Math.random() - 0.5) * 2;
      randomOffsets[i3 + 1] = (Math.random() - 0.5) * 2;
      randomOffsets[i3 + 2] = (Math.random() - 0.5) * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));
    geometry.setAttribute('explodePosition', new THREE.BufferAttribute(explodePositions, 3));
    geometry.setAttribute('randomOffset', new THREE.BufferAttribute(randomOffsets, 3));

    const processImage = (imageUrl: string) => {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const resolution = 200;
        const aspect = img.width / img.height;
        const drawWidth = aspect > 1 ? resolution : resolution * aspect;
        const drawHeight = aspect > 1 ? resolution / aspect : resolution;
        const offsetX = (resolution - drawWidth) / 2;
        const offsetY = (resolution - drawHeight) / 2;
        const validPoints: Array<[number, number, number]> = [];

        canvas.width = resolution;
        canvas.height = resolution;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, resolution, resolution);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        const imageData = ctx.getImageData(0, 0, resolution, resolution).data;
        for (let y = 0; y < resolution; y += 1) {
          for (let x = 0; x < resolution; x += 1) {
            const index = (y * resolution + x) * 4;
            const r = imageData[index] ?? 0;
            const g = imageData[index + 1] ?? 0;
            const b = imageData[index + 2] ?? 0;
            const brightness = (r + g + b) / 3;
            if (brightness > 15) {
              validPoints.push([
                (x / resolution - 0.5) * 38,
                (0.5 - y / resolution) * 38,
                ((r + g + b) / 765 - 0.5) * 12,
              ]);
            }
          }
        }

        if (!validPoints.length) return;

        for (let i = 0; i < PARTICLE_COUNT; i += 1) {
          const i3 = i * 3;
          const point = validPoints[i % validPoints.length];
          const targetX = point[0] + (Math.random() - 0.5) * 0.4;
          const targetY = point[1] + (Math.random() - 0.5) * 0.4;
          const targetZ = point[2] + (Math.random() - 0.5) * 1.5;
          const directionJitterX = (Math.random() - 0.5) * 1.8;
          const directionJitterY = (Math.random() - 0.5) * 1.8;
          const directionJitterZ = (Math.random() - 0.5) * 2.4;
          const length = Math.hypot(targetX + directionJitterX, targetY + directionJitterY, targetZ + directionJitterZ) || 1;
          const burst = 30 + Math.random() * 46;

          targetPositions[i3] = targetX;
          targetPositions[i3 + 1] = targetY;
          targetPositions[i3 + 2] = targetZ;
          explodePositions[i3] = targetX + ((targetX + directionJitterX) / length) * burst + (Math.random() - 0.5) * 26;
          explodePositions[i3 + 1] =
            targetY + ((targetY + directionJitterY) / length) * (burst * 0.94) + (Math.random() - 0.5) * 22;
          explodePositions[i3 + 2] =
            targetZ + ((targetZ + directionJitterZ) / length) * (burst * 0.85) + (Math.random() - 0.5) * 38;
        }

        geometry.getAttribute('targetPosition').needsUpdate = true;
        geometry.getAttribute('explodePosition').needsUpdate = true;
      };
    };

    processImage(sourceImage);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPointSize: { value: pointSize },
        uMorph: { value: 0 },
        uExplode: { value: 0 },
      },
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let raf = 0;
    let time = 0;
    let morph = 0;
    let explode = 0;
    const render = () => {
      const currentMode = modeRef.current;
      if (currentMode === 'hidden') {
        morph = 0;
        explode = 0;
        material.uniforms.uMorph.value = morph;
        material.uniforms.uExplode.value = explode;
        renderer.clear();
        raf = requestAnimationFrame(render);
        return;
      }

      const targetMorph = currentMode === 'idle' ? 0 : 1;
      const targetExplode = currentMode === 'explode' ? 1 : 0;
      morph += (targetMorph - morph) * morphSpeed;
      explode += (targetExplode - explode) * explodeSpeed;

      if (currentMode !== 'idle' || morph > 0.002 || explode > 0.002) {
        time += 0.008;
        points.position.x = Math.sin(time * 0.42) * 0.78 + Math.sin(time * 0.17) * 0.34;
        points.position.y = Math.cos(time * 0.36) * 0.62 + Math.sin(time * 0.21) * 0.28;
        material.uniforms.uTime.value = time;
        material.uniforms.uMorph.value = morph;
        material.uniforms.uExplode.value = explode;
        renderer.render(scene, camera);
      } else {
        renderer.clear();
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [explodeSpeed, morphSpeed, pointSize, sourceImage]);

  return <div ref={containerRef} className={`section-particle-effect ${className}`.trim()} aria-hidden="true" />;
}
