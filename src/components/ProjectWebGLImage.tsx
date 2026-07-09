import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';

const thumbnailVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const thumbnailFragmentShader = `
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

const transitionVertexShader = `
  precision highp float;

  uniform float uProgress;
  uniform float uDistortion;
  uniform float uTime;

  varying vec2 vUv;
  varying float vWave;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float centeredY = uv.y - 0.5;
    float waveA = sin((uv.x * 8.0) + (uProgress * 7.0) + (uTime * 1.2));
    float waveB = sin((uv.y * 12.0) - (uProgress * 9.0) + (uTime * 0.8));
    float edgeSoftness = smoothstep(0.5, 0.08, abs(centeredY));
    float wave = (waveA * 0.42 + waveB * 0.28) * uDistortion * edgeSoftness;

    transformed.y += wave * 0.18;
    transformed.x += sin((uv.y * 10.0) + uTime) * uDistortion * 0.08;
    vWave = wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const transitionFragmentShader = `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float uProgress;
  uniform float uDistortion;
  uniform float uTime;
  uniform vec2 uPlaneResolution;
  uniform vec2 uTextureResolution;

  varying vec2 vUv;
  varying float vWave;

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

  void main() {
    vec2 uv = vUv;
    float ribbon = sin((uv.y * 18.0) + (uProgress * 9.0) + (uTime * 1.1));
    float liquid = sin((uv.x * 10.0) - (uProgress * 7.0) + (uTime * 0.9));
    vec2 direction = normalize(vec2(liquid, ribbon) + 0.0001);
    vec2 distortedUv = uv + direction * uDistortion * 0.055 + vec2(vWave * 0.045, 0.0);
    vec2 textureUv = coverUv(distortedUv, uPlaneResolution, uTextureResolution);

    vec2 chroma = direction * uDistortion * 0.018;
    float r = texture2D(uTexture, clamp(textureUv + chroma, 0.001, 0.999)).r;
    float g = texture2D(uTexture, clamp(textureUv, 0.001, 0.999)).g;
    float b = texture2D(uTexture, clamp(textureUv - chroma, 0.001, 0.999)).b;
    float a = texture2D(uTexture, clamp(textureUv, 0.001, 0.999)).a;

    gl_FragColor = vec4(r, g, b, a);
    #include <colorspace_fragment>
  }
`;

type ProjectWebGLImageProps = {
  alt: string;
  detailId: string;
  detailImages: string[];
  src: string;
  subtitle: string;
  title: string;
};

type TransitionState = {
  active: boolean;
  animationFrame: number;
  cleanup: () => void;
};

const DETAIL_IMAGE_EAGER_COUNT = 4;
const DETAIL_IMAGE_INITIAL_MOUNT_COUNT = 6;
const preloadedDetailImages = new Set<string>();

const preloadDetailImages = (detailImages: string[]) => {
  if (typeof window === 'undefined') return;

  for (const src of detailImages) {
    if (preloadedDetailImages.has(src)) continue;
    preloadedDetailImages.add(src);

    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  }
};

const createTexture = (
  src: string,
  onLoad: (texture: THREE.Texture) => void,
  onError?: () => void,
) => {
  const loader = new THREE.TextureLoader();
  return loader.load(src, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    onLoad(texture);
  }, undefined, onError);
};

const createTextureFromImage = (image: HTMLImageElement) => {
  const texture = new THREE.Texture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

const getTextureSize = (texture: THREE.Texture) => {
  const image = texture.image as { width?: number; height?: number };
  return {
    height: image.height || 1,
    width: image.width || 1,
  };
};

const canUseTextureInRenderer = (renderer: THREE.WebGLRenderer, texture: THREE.Texture) => {
  const size = getTextureSize(texture);
  const maxTextureSize = renderer.capabilities.maxTextureSize;
  return Math.max(size.width, size.height) <= maxTextureSize;
};

const setCameraToViewport = (camera: THREE.OrthographicCamera, width: number, height: number) => {
  camera.left = -width / 2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = -height / 2;
  camera.near = -1000;
  camera.far = 1000;
  camera.position.z = 1;
  camera.updateProjectionMatrix();
};

const getPlanePosition = (rect: DOMRect, viewportWidth: number, viewportHeight: number) => ({
  x: rect.left + rect.width / 2 - viewportWidth / 2,
  y: viewportHeight / 2 - rect.top - rect.height / 2,
});

export default function ProjectWebGLImage({
  alt,
  detailId,
  detailImages,
  src,
  subtitle,
  title,
}: ProjectWebGLImageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const transitionRef = useRef<TransitionState | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let animationFrame = 0;
    let geometry: THREE.PlaneGeometry | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.OrthographicCamera | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let cleaned = false;
    let thumbnailHoverActive = false;
    let thumbnailAnimationActive = false;
    let imageLoadHandler: (() => void) | null = null;
    let imageErrorHandler: (() => void) | null = null;
    let uniforms: {
      uTexture: { value: THREE.Texture };
      uMouse: { value: THREE.Vector2 };
      uHover: { value: number };
      uTime: { value: number };
      uResolution: { value: THREE.Vector2 };
      uTextureResolution: { value: THREE.Vector2 };
    } | null = null;

    const renderThumbnailFrame = (time: number) => {
      if (!renderer || !uniforms || !scene || !camera) return;

      uniforms.uTime.value = time * 0.001;
      renderer.render(scene, camera);
    };

    const animateThumbnail = (time: number) => {
      if (!thumbnailAnimationActive) return;

      renderThumbnailFrame(time);
      animationFrame = requestAnimationFrame(animateThumbnail);
    };

    const startThumbnailAnimation = () => {
      if (thumbnailAnimationActive || cleaned || !renderer || !uniforms) return;

      thumbnailAnimationActive = true;
      animationFrame = requestAnimationFrame(animateThumbnail);
    };

    const stopThumbnailAnimation = () => {
      thumbnailAnimationActive = false;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      renderThumbnailFrame(performance.now());
    };

    const setupRenderer = () => {
      if (cleaned || renderer) return;

      root.classList.remove('is-webgl-ready', 'is-webgl-unavailable');

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0xffffff, 0);
      root.appendChild(renderer.domElement);

      uniforms = {
        uTexture: { value: new THREE.Texture() },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uHover: { value: 0 },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTextureResolution: { value: new THREE.Vector2(1, 1) },
      };

      geometry = new THREE.PlaneGeometry(2, 2, 32, 32);
      material = new THREE.ShaderMaterial({
        fragmentShader: thumbnailFragmentShader,
        toneMapped: false,
        transparent: true,
        uniforms,
        vertexShader: thumbnailVertexShader,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene?.add(mesh);

      const applyThumbnailTexture = (texture: THREE.Texture) => {
        if (cleaned || !uniforms || !renderer) {
          texture.dispose();
          return;
        }

        if (!canUseTextureInRenderer(renderer, texture)) {
          texture.dispose();
          root.classList.add('is-webgl-unavailable');
          return;
        }

        const size = getTextureSize(texture);
        uniforms.uTexture.value.dispose();
        uniforms.uTexture.value = texture;
        uniforms.uTextureResolution.value.set(size.width, size.height);
        root.classList.add('is-webgl-ready');
        root.classList.remove('is-webgl-unavailable');
        renderThumbnailFrame(performance.now());
      };

      const image = imageRef.current;
      if (image?.complete && image.naturalWidth > 0) {
        applyThumbnailTexture(createTextureFromImage(image));
      } else if (image) {
        imageLoadHandler = () => {
          applyThumbnailTexture(createTextureFromImage(image));
        };
        imageErrorHandler = () => {
          root.classList.add('is-webgl-unavailable');
        };
        image.addEventListener('load', imageLoadHandler, { once: true });
        image.addEventListener('error', imageErrorHandler, { once: true });
      } else {
        root.classList.add('is-webgl-unavailable');
      }

      const resize = () => {
        if (!renderer || !uniforms) return;

        const rect = root.getBoundingClientRect();
        const width = Math.max(rect.width, 1);
        const height = Math.max(rect.height, 1);
        renderer.setSize(width, height, false);
        uniforms.uResolution.value.set(width, height);
        renderThumbnailFrame(performance.now());
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(root);
      resize();
    };

    const activateThumbnailHover = () => {
      if (thumbnailHoverActive) return;

      thumbnailHoverActive = true;
      root.dispatchEvent(new CustomEvent('project-image-hover', { bubbles: true, detail: true }));
      preloadDetailImages(detailImages);
      if (uniforms) {
        startThumbnailAnimation();
        gsap.to(uniforms.uHover, {
          value: 1,
          duration: 0.36,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!uniforms) return;

      const rect = root.getBoundingClientRect();
      uniforms.uMouse.value.set(
        (event.clientX - rect.left) / Math.max(rect.width, 1),
        (event.clientY - rect.top) / Math.max(rect.height, 1),
      );
      activateThumbnailHover();
    };

    const handlePointerEnter = () => {
      activateThumbnailHover();
    };

    const handlePointerLeave = () => {
      thumbnailHoverActive = false;
      root.dispatchEvent(new CustomEvent('project-image-hover', { bubbles: true, detail: false }));
      if (uniforms) {
        gsap.to(uniforms.uHover, {
          value: 0,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto',
          onComplete: () => {
            if (uniforms && uniforms.uHover.value <= 0.001) {
              stopThumbnailAnimation();
            }
          },
        });
      }
    };

    const handleClick = () => {
      if (transitionRef.current?.active) return;
      preloadDetailImages(detailImages);
      transitionRef.current = startFullscreenTransition(root, { detailId, detailImages, src, subtitle, title });
    };

    root.addEventListener('click', handleClick);
    root.addEventListener('pointerenter', handlePointerEnter);
    root.addEventListener('pointerleave', handlePointerLeave);
    root.addEventListener('pointermove', handlePointerMove);

    setupRenderer();

    return () => {
      cleaned = true;
      transitionRef.current?.cleanup();
      transitionRef.current = null;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      thumbnailAnimationActive = false;
      thumbnailHoverActive = false;
      resizeObserver?.disconnect();
      root.classList.remove('is-webgl-ready', 'is-webgl-unavailable');
      root.removeEventListener('click', handleClick);
      root.removeEventListener('pointerenter', handlePointerEnter);
      root.removeEventListener('pointerleave', handlePointerLeave);
      root.removeEventListener('pointermove', handlePointerMove);
      if (imageLoadHandler) {
        imageRef.current?.removeEventListener('load', imageLoadHandler);
      }
      if (imageErrorHandler) {
        imageRef.current?.removeEventListener('error', imageErrorHandler);
      }
      if (uniforms) {
        gsap.killTweensOf(uniforms.uHover);
        uniforms.uTexture.value.dispose();
      }
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [detailId, detailImages, src, subtitle, title]);

  return (
    <div ref={rootRef} aria-label={alt} className="project-webgl-image" role="img" tabIndex={0}>
      <img ref={imageRef} src={src} alt="" aria-hidden="true" />
    </div>
  );
}

type ProjectTransitionPayload = {
  detailId: string;
  detailImages: string[];
  src: string;
  subtitle: string;
  title: string;
};

function startFullscreenTransition(root: HTMLElement, payload: ProjectTransitionPayload): TransitionState {
  const { detailId, detailImages, src, subtitle, title } = payload;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const startRect = root.getBoundingClientRect();
  const startPosition = getPlanePosition(startRect, viewportWidth, viewportHeight);
  let cleaned = false;
  let closing = false;
  const overlay = document.createElement('div');
  overlay.className = 'project-image-transition';
  overlay.dataset.projectDetailId = detailId;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'project-image-transition-back';
  closeButton.textContent = '\u8fd4\u56de';

  const scrollPage = document.createElement('div');
  scrollPage.className = 'project-image-transition-scroll';
  scrollPage.dataset.projectDetailId = detailId;
  scrollPage.tabIndex = -1;

  const hero = document.createElement('section');
  hero.className = 'project-image-transition-hero';

  const fallbackImage = document.createElement('img');
  fallbackImage.className = 'project-image-transition-fallback';
  fallbackImage.src = src;
  fallbackImage.alt = '';
  fallbackImage.loading = 'eager';
  fallbackImage.decoding = 'async';
  fallbackImage.setAttribute('aria-hidden', 'true');

  const pageBody = document.createElement('section');
  pageBody.className = 'project-image-page-body';
  pageBody.dataset.projectDetailId = detailId;

  const pageInner = document.createElement('div');
  pageInner.className = 'project-image-page-inner';
  let detailGalleryMountTimer = 0;
  let mountDetailImages: (() => void) | null = null;

  if (detailImages.length > 0) {
    const gallery = document.createElement('div');
    gallery.className = 'project-image-page-gallery';
    gallery.dataset.projectDetailId = detailId;

    const appendDetailImagesChunk = (startIndex: number) => {
      if (cleaned) return;

      const fragment = document.createDocumentFragment();
      const chunkSize = startIndex === 0 ? DETAIL_IMAGE_INITIAL_MOUNT_COUNT : 2;
      const endIndex = Math.min(startIndex + chunkSize, detailImages.length);

      for (let index = startIndex; index < endIndex; index += 1) {
        const image = detailImages[index];
        const isPriorityImage = index < DETAIL_IMAGE_EAGER_COUNT;
        const figure = document.createElement('figure');
        figure.className = `project-image-page-shot project-image-page-shot-${index + 1}`;

        const img = document.createElement('img');
        img.src = image;
        img.alt = '';
        img.loading = isPriorityImage ? 'eager' : 'lazy';
        img.decoding = 'async';
        img.sizes = '(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw';
        img.setAttribute('fetchpriority', isPriorityImage ? 'high' : 'low');

        figure.appendChild(img);
        fragment.appendChild(figure);
      }

      gallery.appendChild(fragment);

      if (endIndex < detailImages.length) {
        detailGalleryMountTimer = window.setTimeout(() => appendDetailImagesChunk(endIndex), 90);
      }
    };

    mountDetailImages = () => {
      if (gallery.childElementCount > 0 || detailGalleryMountTimer || cleaned) return;
      detailGalleryMountTimer = window.setTimeout(() => appendDetailImagesChunk(0), 0);
    };

    pageInner.appendChild(gallery);
  } else {
    const pageHeading = document.createElement('header');
    pageHeading.className = 'project-image-page-heading';

    const eyebrow = document.createElement('p');
    eyebrow.textContent = subtitle;

    const heading = document.createElement('h2');
    heading.textContent = title;

    pageHeading.append(eyebrow, heading);
    pageInner.appendChild(pageHeading);
  }

  pageBody.appendChild(pageInner);
  hero.appendChild(fallbackImage);
  scrollPage.append(hero, pageBody);
  overlay.append(closeButton, scrollPage);
  document.body.appendChild(overlay);
  scrollPage.focus({ preventScroll: true });
  mountDetailImages?.();

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera();
  setCameraToViewport(camera, viewportWidth, viewportHeight);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0xffffff, 0);
  renderer.setSize(viewportWidth, viewportHeight, false);
  hero.appendChild(renderer.domElement);

  const transition = { progress: 0, distortion: 0 };
  const uniforms = {
    uTexture: { value: new THREE.Texture() },
    uProgress: { value: 0 },
    uDistortion: { value: 0 },
    uTime: { value: 0 },
    uPlaneResolution: { value: new THREE.Vector2(startRect.width, startRect.height) },
    uTextureResolution: { value: new THREE.Vector2(1, 1) },
  };

  const geometry = new THREE.PlaneGeometry(1, 1, 96, 96);
  const material = new THREE.ShaderMaterial({
    fragmentShader: transitionFragmentShader,
    toneMapped: false,
    transparent: true,
    uniforms,
    vertexShader: transitionVertexShader,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(startPosition.x, startPosition.y, 0);
  mesh.scale.set(startRect.width, startRect.height, 1);
  scene.add(mesh);

  const loadedTexture = createTexture(src, (texture) => {
    if (cleaned) {
      texture.dispose();
      return;
    }

    if (!canUseTextureInRenderer(renderer, texture)) {
      texture.dispose();
      overlay.classList.add('is-webgl-unavailable');
      return;
    }

    const size = getTextureSize(texture);
    uniforms.uTexture.value.dispose();
    uniforms.uTexture.value = texture;
    uniforms.uTextureResolution.value.set(size.width, size.height);
    overlay.classList.add('is-webgl-ready');
    overlay.classList.remove('is-webgl-unavailable');
  }, () => {
    overlay.classList.add('is-webgl-unavailable');
  });

  const renderState = {
    x: startPosition.x,
    y: startPosition.y,
    width: startRect.width,
    height: startRect.height,
  };

  root.classList.add('is-fullscreen-transitioning');
  document.body.classList.add('project-image-transition-open');

  const target = {
    x: 0,
    y: 0,
    width: viewportWidth,
    height: viewportHeight,
  };

  const timeline = gsap.timeline({
    defaults: { ease: 'power4.inOut' },
    onComplete: () => {
      overlay.classList.add('is-settled');
      gsap.to(transition, {
        distortion: 0,
        duration: 0.32,
        ease: 'power3.out',
        onUpdate: () => {
          uniforms.uDistortion.value = transition.distortion;
        },
      });
    },
  });

  timeline
    .to(renderState, {
      x: target.x,
      y: target.y,
      width: target.width,
      height: target.height,
      duration: 1.05,
      onUpdate: () => {
        mesh.position.set(renderState.x, renderState.y, 0);
        mesh.scale.set(renderState.width, renderState.height, 1);
        uniforms.uPlaneResolution.value.set(renderState.width, renderState.height);
      },
    })
    .fromTo(
      transition,
      { progress: 0, distortion: 0 },
      {
        progress: 1,
        distortion: 1,
        duration: 0.58,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        onUpdate: () => {
          uniforms.uProgress.value = transition.progress;
          uniforms.uDistortion.value = transition.distortion;
        },
      },
      0,
    );

  const state: TransitionState = {
    active: true,
    animationFrame: 0,
    cleanup,
  };

  const animate = (time: number) => {
    uniforms.uTime.value = time * 0.001;
    renderer.render(scene, camera);
    state.animationFrame = requestAnimationFrame(animate);
  };
  animate(0);

  const close = () => {
    if (closing || cleaned) return;
    closing = true;
    timeline.kill();
    overlay.classList.remove('is-settled');
    scrollPage.scrollTop = 0;
    gsap.killTweensOf([renderState, transition]);
    const hasTransitionWebGL = overlay.classList.contains('is-webgl-ready');
    gsap.set(renderer.domElement, { opacity: hasTransitionWebGL ? 1 : 0 });
    gsap.set(fallbackImage, { opacity: hasTransitionWebGL ? 0 : 1 });

    const rect = root.getBoundingClientRect();
    const position = getPlanePosition(rect, window.innerWidth, window.innerHeight);

    const closeTimeline = gsap.timeline({
      defaults: { ease: 'power4.inOut' },
      onComplete: cleanup,
    });

    closeTimeline
      .to(renderState, {
        x: position.x,
        y: position.y,
        width: rect.width,
        height: rect.height,
        duration: 1.05,
        onUpdate: () => {
          mesh.position.set(renderState.x, renderState.y, 0);
          mesh.scale.set(renderState.width, renderState.height, 1);
          uniforms.uPlaneResolution.value.set(renderState.width, renderState.height);
        },
      })
      .fromTo(
        transition,
        { progress: 1, distortion: 0 },
        {
          progress: 0,
          distortion: 1,
          duration: 0.58,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
          onUpdate: () => {
            uniforms.uProgress.value = transition.progress;
            uniforms.uDistortion.value = transition.distortion;
          },
        },
        0,
      );
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close();
  };

  const handleOverlayClick = (event: MouseEvent) => {
    if (event.target === overlay) close();
  };

  let lastTouchY = 0;
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
    scrollPage.scrollTop += event.deltaY;
  };

  const handleTouchStart = (event: TouchEvent) => {
    lastTouchY = event.touches[0]?.clientY ?? 0;
  };

  const handleTouchMove = (event: TouchEvent) => {
    const currentY = event.touches[0]?.clientY ?? lastTouchY;
    const deltaY = lastTouchY - currentY;
    lastTouchY = currentY;
    event.preventDefault();
    event.stopPropagation();
    scrollPage.scrollTop += deltaY;
  };

  const handlePageKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      scrollPage.scrollTop += 90;
    }
    if (event.key === 'ArrowUp') {
      scrollPage.scrollTop -= 90;
    }
    if (event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
      scrollPage.scrollTop += window.innerHeight * 0.86;
    }
    if (event.key === 'PageUp') {
      event.preventDefault();
      scrollPage.scrollTop -= window.innerHeight * 0.86;
    }
  };

  overlay.addEventListener('click', handleOverlayClick);
  overlay.addEventListener('wheel', handleWheel, { passive: false });
  overlay.addEventListener('touchstart', handleTouchStart, { passive: true });
  overlay.addEventListener('touchmove', handleTouchMove, { passive: false });
  closeButton.addEventListener('click', close);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keydown', handlePageKeyDown);

  function cleanup() {
    if (cleaned) return;
    cleaned = true;
    state.active = false;
    cancelAnimationFrame(state.animationFrame);
    if (detailGalleryMountTimer) {
      window.clearTimeout(detailGalleryMountTimer);
    }
    timeline.kill();
    overlay.removeEventListener('click', handleOverlayClick);
    overlay.removeEventListener('wheel', handleWheel);
    overlay.removeEventListener('touchstart', handleTouchStart);
    overlay.removeEventListener('touchmove', handleTouchMove);
    closeButton.removeEventListener('click', close);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keydown', handlePageKeyDown);
    root.classList.remove('is-fullscreen-transitioning');
    document.body.classList.remove('project-image-transition-open');
    loadedTexture.dispose();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    overlay.remove();
  }

  return state;
}
