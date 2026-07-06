import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uTextureResolution;

  varying vec2 vUv;

  vec2 coverUv(vec2 uv, vec2 screen, vec2 image) {
    float screenRatio = screen.x / screen.y;
    float imageRatio = image.x / image.y;
    vec2 scale = vec2(1.0);

    if (screenRatio > imageRatio) {
      scale.y = imageRatio / screenRatio;
    } else {
      scale.x = screenRatio / imageRatio;
    }

    return uv * scale + (1.0 - scale) * 0.5;
  }

  vec4 sampleImage(vec2 uv) {
    vec2 safeUv = clamp(uv, 0.001, 0.999);
    return texture2D(uTexture, safeUv);
  }

  void main() {
    vec2 uv = vUv;
    vec2 mouse = vec2(uMouse.x, 1.0 - uMouse.y);
    float dist = distance(uv, mouse);
    float force = smoothstep(0.42, 0.0, dist) * uHover;
    vec2 direction = normalize(uv - mouse + 0.0001);
    float wave = sin(dist * 42.0 - uTime * 5.0) * 0.014 * force;
    vec2 liquidUv = uv + direction * wave;

    float chroma = smoothstep(0.32, 0.02, dist) * uHover;
    vec2 shift = direction * chroma * 0.014;

    vec2 redUv = coverUv(liquidUv + shift, uResolution, uTextureResolution);
    vec2 greenUv = coverUv(liquidUv, uResolution, uTextureResolution);
    vec2 blueUv = coverUv(liquidUv - shift, uResolution, uTextureResolution);

    vec4 red = sampleImage(redUv);
    vec4 green = sampleImage(greenUv);
    vec4 blue = sampleImage(blueUv);

    gl_FragColor = vec4(red.r, green.g, blue.b, max(max(red.a, green.a), blue.a));
    #include <colorspace_fragment>
  }
`;

type ProjectWebGLImageProps = {
  alt: string;
  src: string;
};

export default function ProjectWebGLImage({ alt, src }: ProjectWebGLImageProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0xffffff, 0);
    root.appendChild(renderer.domElement);

    const uniforms = {
      uTexture: { value: new THREE.Texture() },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTextureResolution: { value: new THREE.Vector2(1, 1) },
    };

    const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);
    const material = new THREE.ShaderMaterial({
      fragmentShader,
      toneMapped: false,
      transparent: true,
      uniforms,
      vertexShader,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const loader = new THREE.TextureLoader();
    loader.load(src, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      uniforms.uTexture.value = texture;
      uniforms.uTextureResolution.value.set(texture.image.width || 1, texture.image.height || 1);
    });

    const resize = () => {
      const rect = root.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width, height);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    resize();

    const handlePointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      uniforms.uMouse.value.set(
        (event.clientX - rect.left) / Math.max(rect.width, 1),
        (event.clientY - rect.top) / Math.max(rect.height, 1),
      );
    };

    const handlePointerEnter = () => {
      root.dispatchEvent(new CustomEvent('project-image-hover', { bubbles: true, detail: true }));
      gsap.to(uniforms.uHover, { value: 1, duration: 0.36, ease: 'power3.out' });
    };

    const handlePointerLeave = () => {
      root.dispatchEvent(new CustomEvent('project-image-hover', { bubbles: true, detail: false }));
      gsap.to(uniforms.uHover, { value: 0, duration: 0.5, ease: 'power3.out' });
    };

    root.addEventListener('pointerenter', handlePointerEnter);
    root.addEventListener('pointerleave', handlePointerLeave);
    root.addEventListener('pointermove', handlePointerMove);

    let animationFrame = 0;
    const animate = (time: number) => {
      uniforms.uTime.value = time * 0.001;
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };
    animate(0);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      root.removeEventListener('pointerenter', handlePointerEnter);
      root.removeEventListener('pointerleave', handlePointerLeave);
      root.removeEventListener('pointermove', handlePointerMove);
      gsap.killTweensOf(uniforms.uHover);
      uniforms.uTexture.value.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [src]);

  return (
    <div ref={rootRef} aria-label={alt} className="project-webgl-image" role="img">
      <img src={src} alt="" aria-hidden="true" />
    </div>
  );
}
