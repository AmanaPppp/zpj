import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';

type PrismProps = {
  height?: number;
  baseWidth?: number;
  animationType?: 'rotate' | 'hover' | '3drotate';
  glow?: number;
  offset?: { x?: number; y?: number };
  noise?: number;
  transparent?: boolean;
  scale?: number;
  hueShift?: number;
  colorFrequency?: number;
  hoverStrength?: number;
  inertia?: number;
  bloom?: number;
  suspendWhenOffscreen?: boolean;
  timeScale?: number;
};

type PrismContainer = HTMLDivElement & { __prismIO?: IntersectionObserver };

const vertex = /* glsl */ `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform vec2  iResolution;
  uniform float iTime;
  uniform int   uUseBaseWobble;
  uniform mat3  uRot;
  uniform float uGlow;
  uniform vec2  uOffsetPx;
  uniform float uNoise;
  uniform float uSaturation;
  uniform float uScale;
  uniform float uHueShift;
  uniform float uColorFreq;
  uniform float uBloom;
  uniform float uCenterShift;
  uniform float uInvBaseHalf;
  uniform float uInvHeight;
  uniform float uMinAxis;
  uniform float uPxScale;
  uniform float uTimeScale;

  vec4 tanh4(vec4 x){
    vec4 e2x = exp(2.0*x);
    return (e2x - 1.0) / (e2x + 1.0);
  }

  float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float sdOctaAnisoInv(vec3 p){
    vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
    float m = q.x + q.y + q.z - 1.0;
    return m * uMinAxis * 0.5773502691896258;
  }

  float sdPyramidUpInv(vec3 p){
    float oct = sdOctaAnisoInv(p);
    float halfSpace = -p.y;
    return max(oct, halfSpace);
  }

  mat3 hueRotation(float a){
    float c = cos(a), s = sin(a);
    mat3 W = mat3(
      0.299, 0.587, 0.114,
      0.299, 0.587, 0.114,
      0.299, 0.587, 0.114
    );
    mat3 U = mat3(
       0.701, -0.587, -0.114,
      -0.299,  0.413, -0.114,
      -0.300, -0.588,  0.886
    );
    mat3 V = mat3(
       0.168, -0.331,  0.500,
       0.328,  0.035, -0.500,
      -0.497,  0.296,  0.201
    );
    return W + U * c + V * s;
  }

  void main(){
    vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;
    float z = 5.0;
    float d = 0.0;
    vec3 p;
    vec4 o = vec4(0.0);
    float cf = uColorFreq;

    mat2 wob = mat2(1.0);
    if (uUseBaseWobble == 1) {
      float t = iTime * uTimeScale;
      float c0 = cos(t + 0.0);
      float c1 = cos(t + 33.0);
      float c2 = cos(t + 11.0);
      wob = mat2(c0, c1, c2, c0);
    }

    const int STEPS = 100;
    for (int i = 0; i < STEPS; i++) {
      p = vec3(f, z);
      p.xz = p.xz * wob;
      p = uRot * p;
      vec3 q = p;
      q.y += uCenterShift;
      d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
      z -= d;
      o += (sin((p.y + z) * cf + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
    }

    o = tanh4(o * o * (uGlow * uBloom) / 1e5);

    vec3 col = o.rgb;
    float n = rand(gl_FragCoord.xy + vec2(iTime));
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);

    float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

    if(abs(uHueShift) > 0.0001){
      col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
    }

    gl_FragColor = vec4(col, o.a);
  }
`;

const setMat3FromEuler = (yawY: number, pitchX: number, rollZ: number, out: Float32Array) => {
  const cy = Math.cos(yawY);
  const sy = Math.sin(yawY);
  const cx = Math.cos(pitchX);
  const sx = Math.sin(pitchX);
  const cz = Math.cos(rollZ);
  const sz = Math.sin(rollZ);

  out[0] = cy * cz + sy * sx * sz;
  out[1] = cx * sz;
  out[2] = -sy * cz + cy * sx * sz;
  out[3] = -cy * sz + sy * sx * cz;
  out[4] = cx * cz;
  out[5] = sy * sz + cy * sx * cz;
  out[6] = sy * cx;
  out[7] = -sx;
  out[8] = cy * cx;
  return out;
};

export default function Prism({
  height = 3.5,
  baseWidth = 5.5,
  animationType = 'rotate',
  glow = 1,
  offset = { x: 0, y: 0 },
  noise = 0.5,
  transparent = true,
  scale = 3.6,
  hueShift = 0,
  colorFrequency = 1,
  hoverStrength = 2,
  inertia = 0.05,
  bloom = 1,
  suspendWhenOffscreen = false,
  timeScale = 0.5,
}: PrismProps) {
  const containerRef = useRef<PrismContainer>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const safeHeight = Math.max(0.001, height);
    const baseHalf = Math.max(0.001, baseWidth) * 0.5;
    const safeScale = Math.max(0.001, scale);
    const safeTimeScale = Math.max(0, timeScale);
    const safeHoverStrength = Math.max(0, hoverStrength);
    const safeInertia = Math.max(0, Math.min(1, inertia));
    const safeNoise = Math.max(0, noise);
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const renderer = new Renderer({
      dpr,
      alpha: transparent,
      antialias: false,
    });
    const gl = renderer.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    Object.assign(gl.canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block',
      pointerEvents: 'none',
    });
    container.appendChild(gl.canvas);

    const iResBuf = new Float32Array(2);
    const offsetPxBuf = new Float32Array(2);
    const rotBuf = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: iResBuf },
        iTime: { value: 0 },
        uUseBaseWobble: { value: animationType === 'rotate' ? 1 : 0 },
        uRot: { value: rotBuf },
        uGlow: { value: Math.max(0, glow) },
        uOffsetPx: { value: offsetPxBuf },
        uNoise: { value: safeNoise },
        uSaturation: { value: transparent ? 1.5 : 1 },
        uScale: { value: safeScale },
        uHueShift: { value: hueShift },
        uColorFreq: { value: Math.max(0, colorFrequency) },
        uBloom: { value: Math.max(0, bloom) },
        uCenterShift: { value: safeHeight * 0.25 },
        uInvBaseHalf: { value: 1 / baseHalf },
        uInvHeight: { value: 1 / safeHeight },
        uMinAxis: { value: Math.min(baseHalf, safeHeight) },
        uPxScale: { value: 1 },
        uTimeScale: { value: safeTimeScale },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const width = container.clientWidth || 1;
      const heightPx = container.clientHeight || 1;
      renderer.setSize(width, heightPx);
      iResBuf[0] = gl.drawingBufferWidth;
      iResBuf[1] = gl.drawingBufferHeight;
      offsetPxBuf[0] = (offset.x ?? 0) * dpr;
      offsetPxBuf[1] = (offset.y ?? 0) * dpr;
      program.uniforms.uPxScale.value = 1 / ((gl.drawingBufferHeight || 1) * 0.1 * safeScale);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    let raf = 0;
    const t0 = performance.now();
    const random = () => Math.random();
    const wX = 0.3 + random() * 0.6;
    const wY = 0.2 + random() * 0.7;
    const wZ = 0.1 + random() * 0.5;
    const phX = random() * Math.PI * 2;
    const phZ = random() * Math.PI * 2;
    let yaw = 0;
    let pitch = 0;
    let roll = 0;
    let targetYaw = 0;
    let targetPitch = 0;
    const pointer = { x: 0, y: 0, inside: true };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const render = (timeStamp: number) => {
      const time = (timeStamp - t0) * 0.001;
      program.uniforms.iTime.value = time;
      let continueRAF = true;

      if (animationType === 'hover') {
        targetYaw = (pointer.inside ? -pointer.x : 0) * 0.6 * safeHoverStrength;
        targetPitch = (pointer.inside ? pointer.y : 0) * 0.6 * safeHoverStrength;
        yaw = lerp(yaw, targetYaw, safeInertia);
        pitch = lerp(pitch, targetPitch, safeInertia);
        roll = lerp(roll, 0, 0.1);
        program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
        continueRAF = safeNoise >= 1e-6 || Math.abs(yaw - targetYaw) >= 1e-4 || Math.abs(pitch - targetPitch) >= 1e-4;
      } else if (animationType === '3drotate') {
        const scaled = time * safeTimeScale;
        yaw = scaled * wY;
        pitch = Math.sin(scaled * wX + phX) * 0.6;
        roll = Math.sin(scaled * wZ + phZ) * 0.5;
        program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
        continueRAF = safeTimeScale >= 1e-6;
      } else {
        rotBuf.set([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        program.uniforms.uRot.value = rotBuf;
        continueRAF = safeTimeScale >= 1e-6;
      }

      renderer.render({ scene: mesh });
      raf = continueRAF ? requestAnimationFrame(render) : 0;
    };

    const startRAF = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const stopRAF = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.5;
      pointer.x = Math.max(-1, Math.min(1, (event.clientX - cx) / Math.max(1, rect.width * 0.5)));
      pointer.y = Math.max(-1, Math.min(1, (event.clientY - cy) / Math.max(1, rect.height * 0.5)));
      pointer.inside = true;
      startRAF();
    };

    const onPointerLeave = () => {
      pointer.inside = false;
      startRAF();
    };

    if (animationType === 'hover') {
      container.addEventListener('pointermove', onPointerMove, { passive: true });
      container.addEventListener('pointerleave', onPointerLeave);
    }

    if (suspendWhenOffscreen) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) startRAF();
        else stopRAF();
      });
      io.observe(container);
      container.__prismIO = io;
    }

    startRAF();

    return () => {
      stopRAF();
      ro.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.__prismIO?.disconnect();
      delete container.__prismIO;
      if (gl.canvas.parentElement === container) {
        container.removeChild(gl.canvas);
      }
    };
  }, [
    animationType,
    baseWidth,
    bloom,
    colorFrequency,
    glow,
    height,
    hoverStrength,
    inertia,
    noise,
    offset.x,
    offset.y,
    scale,
    suspendWhenOffscreen,
    timeScale,
    transparent,
    hueShift,
  ]);

  return <div ref={containerRef} className="prism-container" aria-hidden="true" />;
}
