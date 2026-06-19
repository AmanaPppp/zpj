import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import './BorderGlow.css';

interface BorderGlowProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
}

type GlowVars = CSSProperties & Record<`--${string}`, string | number>;

function parseHSL(hslStr: string) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function buildGlowVars(glowColor: string, intensity: number): GlowVars {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  const vars: GlowVars = {};

  for (let i = 0; i < opacities.length; i += 1) {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
  }

  return vars;
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const GRADIENT_KEYS = [
  '--gradient-one',
  '--gradient-two',
  '--gradient-three',
  '--gradient-four',
  '--gradient-five',
  '--gradient-six',
  '--gradient-seven',
] as const;
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]): GlowVars {
  const vars: GlowVars = {};

  for (let i = 0; i < 7; i += 1) {
    const color = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${color} 0px, transparent 50%)`;
  }

  vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

function easeInCubic(x: number) {
  return x * x * x;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function setGlowIntensity(
  card: HTMLElement,
  edge: number,
  edgeSensitivity: number,
  colorSensitivity: number,
  fillOpacity: number
) {
  const edgeAlpha = clamp01((edge - edgeSensitivity) / (100 - edgeSensitivity));
  const colorAlpha = clamp01((edge - colorSensitivity) / (100 - colorSensitivity));

  card.style.setProperty('--edge-light-opacity', edgeAlpha.toFixed(3));
  card.style.setProperty('--edge-color-opacity', colorAlpha.toFixed(3));
  card.style.setProperty('--edge-fill-visible-opacity', (colorAlpha * fillOpacity).toFixed(3));
}

function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}: {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (x: number) => number;
  onUpdate: (value: number) => void;
  onEnd?: () => void;
}) {
  const t0 = performance.now() + delay;

  function tick() {
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else onEnd?.();
  }

  window.setTimeout(() => requestAnimationFrame(tick), delay);
}

export default function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = '#120F17',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ['#c084fc', '#f472b6', '#38bdf8'],
  fillOpacity = 0.5,
  style,
  onPointerMove,
  onPointerLeave,
  ...props
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const colorSensitivity = edgeSensitivity + 20;

  const getCenterOfElement = useCallback((el: HTMLElement) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const getEdgeProximity = useCallback(
    (el: HTMLElement, x: number, y: number) => {
      const [cx, cy] = getCenterOfElement(el);
      const dx = x - cx;
      const dy = y - cy;
      let kx = Infinity;
      let ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    },
    [getCenterOfElement]
  );

  const getCursorAngle = useCallback(
    (el: HTMLElement, x: number, y: number) => {
      const [cx, cy] = getCenterOfElement(el);
      const dx = x - cx;
      const dy = y - cy;
      if (dx === 0 && dy === 0) return 0;
      const radians = Math.atan2(dy, dx);
      let degrees = radians * (180 / Math.PI) + 90;
      if (degrees < 0) degrees += 360;
      return degrees;
    },
    [getCenterOfElement]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const edge = getEdgeProximity(card, x, y);
      const angle = getCursorAngle(card, x, y);

      card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`);
      card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
      card.classList.add('is-edge-active');
      setGlowIntensity(card, edge * 100, edgeSensitivity, colorSensitivity, fillOpacity);
      onPointerMove?.(event);
    },
    [colorSensitivity, edgeSensitivity, fillOpacity, getCursorAngle, getEdgeProximity, onPointerMove]
  );

  const handlePointerLeave = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    card.classList.remove('is-edge-active');
    card.style.setProperty('--edge-proximity', '0');
    card.style.setProperty('--edge-light-opacity', '0');
    card.style.setProperty('--edge-color-opacity', '0');
    card.style.setProperty('--edge-fill-visible-opacity', '0');
    onPointerLeave?.(event);
  }, [onPointerLeave]);

  useEffect(() => {
    if (!animated || !cardRef.current) return undefined;
    const card = cardRef.current;
    const angleStart = 110;
    const angleEnd = 465;
    card.classList.add('sweep-active');
    card.style.setProperty('--cursor-angle', `${angleStart}deg`);

    animateValue({
      duration: 500,
      onUpdate: (value) => {
        card.style.setProperty('--edge-proximity', String(value));
        setGlowIntensity(card, value, edgeSensitivity, colorSensitivity, fillOpacity);
      },
    });
    animateValue({
      ease: easeInCubic,
      duration: 1500,
      end: 50,
      onUpdate: (value) => {
        card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`);
      },
    });
    animateValue({
      ease: easeOutCubic,
      delay: 1500,
      duration: 2250,
      start: 50,
      end: 100,
      onUpdate: (value) => {
        card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`);
      },
    });
    animateValue({
      ease: easeInCubic,
      delay: 2500,
      duration: 1500,
      start: 100,
      end: 0,
      onUpdate: (value) => {
        card.style.setProperty('--edge-proximity', String(value));
        setGlowIntensity(card, value, edgeSensitivity, colorSensitivity, fillOpacity);
      },
      onEnd: () => {
        card.classList.remove('sweep-active');
        card.style.setProperty('--edge-light-opacity', '0');
        card.style.setProperty('--edge-color-opacity', '0');
        card.style.setProperty('--edge-fill-visible-opacity', '0');
      },
    });

    return undefined;
  }, [animated, colorSensitivity, edgeSensitivity, fillOpacity]);

  const glowVars: GlowVars = {
    '--card-bg': backgroundColor,
    '--edge-sensitivity': edgeSensitivity,
    '--edge-light-opacity': 0,
    '--edge-color-opacity': 0,
    '--edge-fill-visible-opacity': 0,
    '--border-radius': `${borderRadius}px`,
    '--glow-padding': `${glowRadius}px`,
    '--cone-spread': coneSpread,
    '--fill-opacity': fillOpacity,
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors),
    ...style,
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`border-glow-card ${fillOpacity <= 0 ? 'border-glow-no-fill ' : ''}${className}`}
      style={glowVars}
      {...props}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
