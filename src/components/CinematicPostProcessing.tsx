import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { cinematicRevealState } from '../lib/cinematicRevealState';

const CinematicLensShader = {
  uniforms: {
    tDiffuse: { value: null },
    uAberration: { value: 0 },
    uDistortion: { value: 0 },
    uVignette: { value: 0.28 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uAberration;
    uniform float uDistortion;
    uniform float uVignette;
    varying vec2 vUv;

    vec2 distortUv(vec2 uv) {
      vec2 centered = uv - 0.5;
      float r2 = dot(centered, centered);
      return uv + centered * r2 * uDistortion;
    }

    void main() {
      vec2 uv = distortUv(vUv);
      vec2 direction = normalize(uv - 0.5 + 0.0001);
      vec2 shift = direction * uAberration;

      float red = texture2D(tDiffuse, uv + shift).r;
      float green = texture2D(tDiffuse, uv).g;
      float blue = texture2D(tDiffuse, uv - shift).b;
      vec3 color = vec3(red, green, blue);

      float vignette = smoothstep(0.9, 0.22, length(vUv - 0.5));
      color *= mix(1.0 - uVignette, 1.0, vignette);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

export default function CinematicPostProcessing() {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  const lensPassRef = useRef<ShaderPass | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
    composer.setSize(size.width, size.height);

    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.18, 0.34, 0.86);
    const lensPass = new ShaderPass(CinematicLensShader);
    const outputPass = new OutputPass();

    lensPass.uniforms.uAberration.value = 0.00045;
    lensPass.uniforms.uDistortion.value = 0.004;

    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composer.addPass(lensPass);
    composer.addPass(outputPass);

    composerRef.current = composer;
    lensPassRef.current = lensPass;
    bloomPassRef.current = bloomPass;

    const handleRevealComplete = () => {
      lensPass.uniforms.uAberration.value = 0.00026;
      lensPass.uniforms.uDistortion.value = 0.002;
      bloomPass.strength = 0.12;
      bloomPass.radius = 0.24;
    };

    window.addEventListener('earth-cinematic-reveal-complete', handleRevealComplete);

    return () => {
      window.removeEventListener('earth-cinematic-reveal-complete', handleRevealComplete);
      composer.dispose();
      composerRef.current = null;
      lensPassRef.current = null;
      bloomPassRef.current = null;
    };
  }, [camera, gl, scene, size.height, size.width]);

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height);
    bloomPassRef.current?.setSize(size.width, size.height);
  }, [size.height, size.width]);

  useFrame(() => {
    const lensPass = lensPassRef.current;
    const bloomPass = bloomPassRef.current;
    if (lensPass && bloomPass && cinematicRevealState.active) {
      const { easedProgress, velocity } = cinematicRevealState;
      const motionPeak = Math.sin(easedProgress * Math.PI);

      lensPass.uniforms.uAberration.value = 0.00032 + motionPeak * 0.0012 + velocity * 0.00045;
      lensPass.uniforms.uDistortion.value = 0.003 + motionPeak * 0.012;
      bloomPass.strength = 0.16 + motionPeak * 0.22;
      bloomPass.radius = 0.28 + motionPeak * 0.18;
    }
    composerRef.current?.render();
  }, 1);

  return null;
}
