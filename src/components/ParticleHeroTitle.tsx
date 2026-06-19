import { useEffect, useRef } from 'react';

interface Vector2D {
  x: number;
  y: number;
}

class TitleParticle {
  pos: Vector2D = { x: 0, y: 0 };
  vel: Vector2D = { x: 0, y: 0 };
  target: Vector2D = { x: 0, y: 0 };
  home: Vector2D = { x: 0, y: 0 };
  size = 1.6;
  brightness = 0.9;
  color: [number, number, number] = [255, 255, 255];
  alpha = 0;
  targetAlpha = 0;
  maxSpeed = 5.6;
  maxForce = 0.28;

  move() {
    const dx = this.target.x - this.pos.x;
    const dy = this.target.y - this.pos.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 0.05) {
      const slowDown = Math.min(distance / 80, 1);
      const desiredX = (dx / distance) * this.maxSpeed * slowDown;
      const desiredY = (dy / distance) * this.maxSpeed * slowDown;
      const steerX = desiredX - this.vel.x;
      const steerY = desiredY - this.vel.y;
      const steerMagnitude = Math.hypot(steerX, steerY) || 1;

      this.vel.x += (steerX / steerMagnitude) * this.maxForce;
      this.vel.y += (steerY / steerMagnitude) * this.maxForce;
    }

    this.vel.x *= 0.86;
    this.vel.y *= 0.86;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    if (
      distance < 0.42 &&
      Math.abs(this.vel.x) < 0.08 &&
      Math.abs(this.vel.y) < 0.08
    ) {
      this.pos.x = this.target.x;
      this.pos.y = this.target.y;
      this.vel.x = 0;
      this.vel.y = 0;
    }

    this.alpha += (this.targetAlpha - this.alpha) * 0.08;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha < 0.01) return;

    const alpha = this.alpha * this.brightness;
    const [r, g, b] = this.color;

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.fillRect(this.pos.x, this.pos.y, this.size, this.size);

    if (this.brightness > 0.72) {
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.28})`;
      ctx.fillRect(this.pos.x - this.size, this.pos.y, this.size * 3, this.size);
      ctx.fillRect(this.pos.x, this.pos.y - this.size, this.size, this.size * 3);
    }
  }
}

interface ParticleHeroTitleProps {
  text: string;
}

export default function ParticleHeroTitle({ text }: ParticleHeroTitleProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<TitleParticle[]>([]);
  const targetsRef = useRef<Vector2D[]>([]);
  const rafRef = useRef<number>(0);
  const completionTimeoutRef = useRef<number>(0);
  const metricsRef = useRef({ width: 0, height: 0, dpr: 1 });
  const enteredRef = useRef(false);
  const explodedRef = useRef(false);
  const finalizedRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0, time: 0, inside: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const randomOutside = (width: number, height: number): Vector2D => {
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) return { x: Math.random() * width, y: -height * (0.35 + Math.random() * 0.4) };
      if (edge === 1) return { x: width * (1.1 + Math.random() * 0.35), y: Math.random() * height };
      if (edge === 2) return { x: Math.random() * width, y: height * (1.1 + Math.random() * 0.35) };
      return { x: -width * (0.35 + Math.random() * 0.4), y: Math.random() * height };
    };

    const randomExplosionTarget = (width: number, height: number, from: Vector2D): Vector2D => {
      const centerX = width / 2;
      const centerY = height / 2;
      const dx = from.x - centerX;
      const dy = from.y - centerY;
      const magnitude = Math.hypot(dx, dy) || 1;
      const blast = (width + height) * (0.42 + Math.random() * 0.34);

      return {
        x: from.x + (dx / magnitude) * blast + (Math.random() - 0.5) * width * 0.42,
        y: from.y + (dy / magnitude) * blast + (Math.random() - 0.5) * height * 0.42,
      };
    };

    const mix = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

    const getGradientColor = (x: number, width: number): [number, number, number] => {
      const purple: [number, number, number] = [192, 132, 252];
      const pink: [number, number, number] = [244, 114, 182];
      const cyan: [number, number, number] = [56, 189, 248];
      const progress = Math.max(0, Math.min(1, x / Math.max(1, width)));

      if (progress < 0.5) {
        const t = progress / 0.5;
        return [mix(purple[0], pink[0], t), mix(purple[1], pink[1], t), mix(purple[2], pink[2], t)];
      }

      const t = (progress - 0.5) / 0.5;
      return [mix(pink[0], cyan[0], t), mix(pink[1], cyan[1], t), mix(pink[2], cyan[2], t)];
    };

    const collectTextTargets = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      canvas.width = width;
      canvas.height = height;
      metricsRef.current = { width, height, dpr };

      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const offscreenCtx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!offscreenCtx) return;

      const fontSize = Math.min(width * 0.24, height * 0.76);
      offscreenCtx.clearRect(0, 0, width, height);
      offscreenCtx.fillStyle = '#fff';
      offscreenCtx.font = `800 ${fontSize}px Inter, Arial, sans-serif`;
      offscreenCtx.textAlign = 'center';
      offscreenCtx.textBaseline = 'middle';
      offscreenCtx.fillText(text, width / 2, height / 2 + fontSize * 0.02);

      const imageData = offscreenCtx.getImageData(0, 0, width, height).data;
      const step = Math.max(7, Math.round(7 * dpr));
      const targets: Vector2D[] = [];

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          if (imageData[index + 3] > 70) {
            targets.push({
              x: x + (Math.random() - 0.5) * step * 0.32,
              y: y + (Math.random() - 0.5) * step * 0.32,
            });
          }
        }
      }

      for (let i = targets.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [targets[i], targets[j]] = [targets[j], targets[i]];
      }

      targetsRef.current = targets;
    };

    const formText = (fromCurrentPositions = false) => {
      const { width, height, dpr } = metricsRef.current;
      if (!width || !height || !targetsRef.current.length) return;

      const particles = particlesRef.current;
      targetsRef.current.forEach((target, index) => {
        let particle = particles[index];
        if (!particle) {
          particle = new TitleParticle();
          const start = randomOutside(width, height);
          particle.pos.x = start.x;
          particle.pos.y = start.y;
          particles[index] = particle;
        } else if (!fromCurrentPositions) {
          const start = randomOutside(width, height);
          particle.pos.x = start.x;
          particle.pos.y = start.y;
          particle.vel.x = 0;
          particle.vel.y = 0;
        }

        particle.home = target;
        particle.target = target;
        particle.targetAlpha = 1;
        particle.size = (Math.random() < 0.84 ? 1.45 : 2.35) * dpr;
        particle.brightness = 0.62 + Math.random() * 0.38;
        particle.color = getGradientColor(target.x, width);
        particle.maxSpeed = (fromCurrentPositions ? 8.4 + Math.random() * 4.2 : 18 + Math.random() * 8) * dpr;
        particle.maxForce = (fromCurrentPositions ? 0.28 + Math.random() * 0.22 : 0.68 + Math.random() * 0.34) * dpr;
      });

      particles.length = targetsRef.current.length;
      explodedRef.current = false;
    };

    const explodeText = () => {
      const { width, height } = metricsRef.current;
      if (!width || !height || explodedRef.current) return;

      particlesRef.current.forEach((particle) => {
        particle.target = randomExplosionTarget(width, height, particle.pos);
        particle.targetAlpha = 0;
        particle.vel.x += (Math.random() - 0.5) * 10;
        particle.vel.y += (Math.random() - 0.5) * 8;
        particle.maxSpeed = 9;
        particle.maxForce = 0.18;
      });

      explodedRef.current = true;
    };

    const handleEnter = () => {
      enteredRef.current = true;
      finalizedRef.current = false;
      wrapperRef.current?.classList.remove('is-final-title');
      window.clearTimeout(completionTimeoutRef.current);
      formText(false);

      completionTimeoutRef.current = window.setTimeout(() => {
        finalizedRef.current = true;
        explodedRef.current = false;
        wrapperRef.current?.classList.add('is-final-title');
        particlesRef.current.forEach((particle) => {
          particle.targetAlpha = 0;
        });
      }, 2400);
    };

    const handleScroll = () => {
      if (!enteredRef.current || finalizedRef.current) return;
      if (window.scrollY > window.innerHeight * 0.08) {
        explodeText();
      } else if (explodedRef.current) {
        formText(true);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!enteredRef.current || explodedRef.current || finalizedRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = metricsRef.current.dpr;
      const x = (event.clientX - rect.left) * dpr;
      const y = (event.clientY - rect.top) * dpr;
      const inside = x >= 0 && x <= metricsRef.current.width && y >= 0 && y <= metricsRef.current.height;
      const previous = lastMouseRef.current;
      const now = performance.now();
      const dx = inside && previous.inside ? x - previous.x : 0;
      const dy = inside && previous.inside ? y - previous.y : 0;
      const dt = Math.max(16, now - previous.time);
      const movement = Math.hypot(dx, dy);
      const speed = movement / dt;

      if (inside && movement > 5 * dpr && speed > 0.12) {
        const radius = 130 * dpr;
        const directionX = dx / movement;
        const directionY = dy / movement;
        const perpendicularX = -directionY;
        const perpendicularY = directionX;
        const strength = Math.min(20 * dpr, movement * 0.9);

        particlesRef.current.forEach((particle) => {
          const px = particle.pos.x - x;
          const py = particle.pos.y - y;
          const distance = Math.hypot(px, py);
          if (distance > radius) return;

          const falloff = 1 - distance / radius;
          const scatter = strength * falloff * (0.85 + Math.random() * 0.5);
          const sideScatter = (Math.random() - 0.5) * strength * 0.55 * falloff;
          particle.vel.x += directionX * scatter + perpendicularX * sideScatter;
          particle.vel.y += directionY * scatter + perpendicularY * sideScatter;
          particle.target = particle.home;
          particle.targetAlpha = 1;
        });
      }

      lastMouseRef.current = { x, y, time: now, inside };
    };

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const { width, height } = metricsRef.current;
      if (!ctx || width === 0 || height === 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      particlesRef.current.forEach((particle) => {
        particle.move();
        particle.draw(ctx);
      });
      ctx.globalCompositeOperation = 'source-over';
      rafRef.current = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(() => {
      collectTextTargets();
      if (enteredRef.current && !finalizedRef.current) {
        formText(true);
      }
    });

    resizeObserver.observe(canvas);
    collectTextTargets();
    rafRef.current = requestAnimationFrame(draw);

    window.addEventListener('earth-hero-visible', handleEnter);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.clearTimeout(completionTimeoutRef.current);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('earth-hero-visible', handleEnter);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [text]);

  return (
    <span ref={wrapperRef} className="particle-hero-title-wrap">
      <canvas
        ref={canvasRef}
        className="particle-hero-title"
        aria-hidden="true"
      />
      <span className="particle-hero-real-title" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
