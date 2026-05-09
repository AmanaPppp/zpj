import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticlesFieldProps {
  mouseRef: React.MutableRefObject<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
  }>;
}

export default function ParticlesField({ mouseRef }: ParticlesFieldProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  // Dense starfield like the reference video
  const FAR_PARTICLE_COUNT = 32000;
  const NEAR_PARTICLE_COUNT = 9000;
  const PARTICLE_COUNT = FAR_PARTICLE_COUNT + NEAR_PARTICLE_COUNT;

  const { positions, sizes, brightness } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const brightness = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      const isNearLayer = i >= FAR_PARTICLE_COUNT;

      if (isNearLayer) {
        positions[i3] = (Math.random() - 0.5) * 120;
        positions[i3 + 1] = (Math.random() - 0.5) * 110;
        positions[i3 + 2] = -5 - Math.random() * 22;
      } else {
        // Spread across a wide, relatively flat volume like a distant starfield backdrop.
        positions[i3] = (Math.random() - 0.5) * 190;
        positions[i3 + 1] = (Math.random() - 0.5) * 180;
        positions[i3 + 2] = -14 - Math.random() * 82;
      }

      // Size tiers for star variety — SMALLER for a more delicate starfield feel
      const roll = Math.random();
      if (roll < 0.80) {
        // 80%: tiny background stars
        sizes[i] = (isNearLayer ? 0.62 : 0.45) + Math.random() * (isNearLayer ? 0.55 : 0.45);
        brightness[i] = (isNearLayer ? 0.38 : 0.24) + Math.random() * 0.32;
      } else if (roll < 0.95) {
        // 15%: medium visible stars
        sizes[i] = (isNearLayer ? 1.15 : 1.0) + Math.random() * 0.5;
        brightness[i] = (isNearLayer ? 0.66 : 0.56) + Math.random() * 0.3;
      } else {
        // 5%: bright prominent stars
        sizes[i] = (isNearLayer ? 1.9 : 1.7) + Math.random() * 0.7;
        brightness[i] = 0.76 + Math.random() * 0.24;
      }
    }

    return { positions, sizes, brightness };
  }, []);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uWarp: { value: 0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uWarp;
        uniform vec2 uMouse;
        attribute float aSize;
        attribute float aBrightness;
        varying float vBrightness;
        varying float vSize;

        void main() {
          vec3 pos = position;

          // === 1. Unified cosmic drift (entire field gently floats) ===
          float driftX = uTime * 0.12;
          float driftY = uTime * 0.07;
          pos.x += driftX;
          pos.y += driftY;

          // Wrap around so particles never disappear
          pos.x = mod(pos.x + 95.0, 190.0) - 95.0;
          pos.y = mod(pos.y + 90.0, 180.0) - 90.0;

          // === 2. Large-scale flowing waves (creates the "drifting dust" feel) ===
          float waveSpeed = 0.08;
          float wave1 = sin(uTime * waveSpeed + position.x * 0.03 + position.y * 0.02);
          float wave2 = cos(uTime * waveSpeed * 0.7 + position.x * 0.02 - position.y * 0.03);
          pos.x += wave1 * 1.5;
          pos.y += wave2 * 1.0;
          pos.z += sin(uTime * waveSpeed * 0.5 + position.x * 0.01) * 0.8;

          // === 3. Slow spiral rotation around center (subtle vortex) ===
          float angle = uTime * 0.02 * aBrightness;
          float cosA = cos(angle);
          float sinA = sin(angle);
          float rx = pos.x * cosA - pos.y * sinA * 0.3;
          float ry = pos.x * sinA * 0.3 + pos.y * cosA;
          pos.x = rx;
          pos.y = ry;

          // === 4. Individual micro-wobble (each particle unique, very subtle) ===
          float wobble = 0.08;
          pos.x += sin(uTime * 0.3 * aBrightness + aBrightness * 40.0) * wobble;
          pos.y += cos(uTime * 0.25 * aBrightness + aBrightness * 40.0) * wobble;

          // Intro warp: stretch stars outward from the flight path for a hyperspace feel.
          float radial = length(pos.xy) + 0.0001;
          vec2 warpDir = pos.xy / radial;
          pos.xy += warpDir * uWarp * (3.2 + aBrightness * 5.5);
          pos.z -= uWarp * (8.0 + aBrightness * 7.0);

          // Mouse parallax: stars move slightly opposite to mouse
          float parallax = 1.2 * aBrightness;
          pos.x -= uMouse.x * parallax;
          pos.y -= uMouse.y * parallax;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Size: ensure stars are visible on screen.
          float dist = -mvPosition.z;
          float sizeAtten = 180.0 / max(dist, 10.0);
          gl_PointSize = aSize * uPixelRatio * clamp(sizeAtten, 0.8, 3.0);

          vBrightness = aBrightness;
          vSize = aSize;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uWarp;
        varying float vBrightness;
        varying float vSize;

        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          if (dist > 0.5) discard;

          // Soft circular dot.
          float alpha = (1.0 - smoothstep(0.0, 0.5, dist));

          // Bright core for larger stars (threshold adjusted for smaller sizes)
          if (vSize > 1.4) {
            float coreGlow = 1.0 - smoothstep(0.0, 0.2, dist);
            alpha = max(alpha, coreGlow * 0.5);
          }

          // Twinkle: each star unique timing
          float twinkle = sin(uTime * (0.4 + vBrightness * 0.8) + vBrightness * 20.0) * 0.15 + 0.85;
          alpha *= twinkle;

          alpha *= vBrightness * 0.92;
          alpha *= 1.0 + uWarp * 0.65;

          vec3 color = mix(vec3(0.96, 0.98, 1.0), vec3(0.78, 0.86, 1.0), uWarp * 0.35);

          // Brighter core for large stars
          if (vSize > 1.2) {
            color = mix(color, vec3(1.0, 1.0, 1.0), 1.0 - dist * 2.0);
          }

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      const time = state.clock.elapsedTime;
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uMouse.value.set(
        mouseRef.current.x * 0.3,
        mouseRef.current.y * 0.3
      );
      materialRef.current.uniforms.uWarp.value = 0;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-aBrightness"
          args={[brightness, 1]}
        />
      </bufferGeometry>
      <primitive
        object={shaderMaterial}
        ref={materialRef}
        attach="material"
      />
    </points>
  );
}
