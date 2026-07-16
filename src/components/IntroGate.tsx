import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { preloadProjectDetailImages } from '../sections/ProjectDetailGallery';

const RINGS = [
  'AMANAP  BRAND DESIGN PORTFOLIO  ',
  'CREATIVE VISION  VISUAL IDENTITY  ',
  'SELECTED WORKS  STRATEGY  DESIGN  ',
];

const SCENE_READY_TIMEOUT_MS = 4500;

export default function IntroGate() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<Array<HTMLDivElement | null>>([]);
  const logoRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const enterRef = useRef<() => void>(() => undefined);
  const pointerIntentRef = useRef<{
    id: number;
    startedAt: number;
    x: number;
    y: number;
  } | null>(null);

  const ringLetters = useMemo(() => RINGS.map((item) => item.repeat(2).split('')), []);

  useEffect(() => {
    const overlay = overlayRef.current;
    const rings = ringsRef.current.filter(Boolean) as HTMLDivElement[];
    const logo = logoRef.current;
    const video = videoRef.current;
    if (!overlay || !rings.length || !logo || !video) return;

    let entered = false;
    let disposed = false;
    let introAnimationDone = false;
    let sceneReady = document.documentElement.dataset.portfolioSceneReady === 'true';
    let autoEnterTimer: number | null = null;
    let sceneReadyFallbackTimer: number | null = null;
    const idleTweens: gsap.core.Tween[] = [];
    const startIdleTweens = () => {
      if (idleTweens.length > 0) return;

      idleTweens.push(
        gsap.to(rings[0], {
          rotate: '+=360',
          duration: 18,
          repeat: -1,
          ease: 'none',
        }),
        gsap.to(rings[1], {
          rotate: '-=360',
          duration: 22,
          repeat: -1,
          ease: 'none',
        }),
        gsap.to(rings[2], {
          rotate: '+=360',
          duration: 26,
          repeat: -1,
          ease: 'none',
        })
      );
    };
    const markReady = () => {
      if (disposed || entered || !introAnimationDone || !sceneReady) return;
      logo.classList.add('is-ready');

      if (autoEnterTimer === null) {
        autoEnterTimer = window.setTimeout(() => {
          enterRef.current();
        }, 900);
      }
    };

    const handleSceneReady = () => {
      sceneReady = true;
      if (sceneReadyFallbackTimer !== null) {
        window.clearTimeout(sceneReadyFallbackTimer);
        sceneReadyFallbackTimer = null;
      }
      markReady();
    };

    preloadProjectDetailImages().catch(() => undefined);
    window.addEventListener('portfolio-scene-ready', handleSceneReady);
    if (!sceneReady) {
      sceneReadyFallbackTimer = window.setTimeout(handleSceneReady, SCENE_READY_TIMEOUT_MS);
    }

    const ctx = gsap.context(() => {
      gsap.set(rings, { transformOrigin: '50% 50%' });
      gsap.set(rings[0], { scale: 3.1, rotate: -12 });
      gsap.set(rings[1], { scale: 2.55, rotate: 18 });
      gsap.set(rings[2], { scale: 2.05, rotate: -28 });
      gsap.set(logo, { autoAlpha: 0, scale: 1.8, transformOrigin: '50% 50%' });
      gsap.set(video, {
        filter: 'brightness(0) invert(1) drop-shadow(0 0 0 rgba(255, 255, 255, 0))',
      });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          introAnimationDone = true;
          startIdleTweens();
          markReady();
        },
      });

      tl.to(logo, {
        autoAlpha: 1,
        scale: 1,
        duration: 1.18,
        ease: 'expo.out',
      }, 0.08);

      tl.to(rings[0], {
        rotate: 348,
        duration: 1.45,
        ease: 'none',
      }, 0);

      tl.to(rings[0], {
        scale: 1,
        duration: 1.45,
        ease: 'power3.inOut',
      }, 0);

      tl.to(rings[1], {
        rotate: -342,
        duration: 1.45,
        ease: 'none',
      }, 0);

      tl.to(rings[1], {
        scale: 0.78,
        duration: 1.45,
        ease: 'power3.inOut',
      }, 0);

      tl.to(rings[2], {
        rotate: 332,
        duration: 1.45,
        ease: 'none',
      }, 0);

      tl.to(rings[2], {
        scale: 0.58,
        duration: 1.45,
        ease: 'power3.inOut',
      }, 0);
    }, overlay);

    const enter = () => {
      if (entered) return;
      entered = true;
      logo.style.pointerEvents = 'none';
      video.pause();
      idleTweens.forEach((tween) => tween.kill());

      gsap.killTweensOf([logo, video, rings, overlay]);
      gsap
        .timeline({
          defaults: { ease: 'power4.inOut' },
          onComplete: () => {
            overlay.remove();
            document.documentElement.dataset.portfolioEntered = 'true';
            window.dispatchEvent(new CustomEvent('portfolio-enter'));
          },
        })
        .set(rings, {
          transformOrigin: '50% 50%',
          willChange: 'transform, opacity, filter',
        })
        .set(logo, {
          transformOrigin: '50% 50%',
          willChange: 'opacity, filter',
        })
        .to(
          logo,
          {
            autoAlpha: 0,
            duration: 0.32,
            ease: 'power2.out',
          },
          0
        )
        .to(
          video,
          {
            filter: 'brightness(0) invert(1) drop-shadow(0 0 36px rgba(255, 255, 255, 0.24))',
            duration: 0.32,
            ease: 'power2.inOut',
          },
          0
        )
        .to(
          rings[0],
          {
            rotate: '+=900',
            autoAlpha: 0,
            filter: 'blur(2px)',
            duration: 0.74,
            ease: 'power4.inOut',
          },
          0
        )
        .to(
          rings[1],
          {
            rotate: '-=960',
            autoAlpha: 0,
            filter: 'blur(2px)',
            duration: 0.78,
            ease: 'power4.inOut',
          },
          0
        )
        .to(
          rings[2],
          {
            rotate: '+=1080',
            autoAlpha: 0,
            filter: 'blur(2px)',
            duration: 0.82,
            ease: 'power4.inOut',
          },
          0
        )
        .to(
          overlay,
          {
            backgroundColor: 'rgba(0, 0, 0, 0)',
            duration: 1.05,
            ease: 'power2.inOut',
          },
          0
        );
    };

    enterRef.current = enter;
    video?.play().catch(() => undefined);

    return () => {
      disposed = true;
      enterRef.current = () => undefined;
      if (autoEnterTimer !== null) {
        window.clearTimeout(autoEnterTimer);
      }
      if (sceneReadyFallbackTimer !== null) {
        window.clearTimeout(sceneReadyFallbackTimer);
      }
      window.removeEventListener('portfolio-scene-ready', handleSceneReady);
      idleTweens.forEach((tween) => tween.kill());
      ctx.revert();
    };
  }, []);

  const handleLogoPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.nativeEvent.isTrusted || !event.isPrimary || event.button !== 0) {
      pointerIntentRef.current = null;
      return;
    }

    pointerIntentRef.current = {
      id: event.pointerId,
      startedAt: window.performance.now(),
      x: event.clientX,
      y: event.clientY,
    };
  };

  const clearPointerIntent = () => {
    pointerIntentRef.current = null;
  };

  const handleLogoPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const intent = pointerIntentRef.current;
    pointerIntentRef.current = null;

    if (!intent || !event.nativeEvent.isTrusted || !event.isPrimary || event.button !== 0) return;
    if (event.pointerId !== intent.id) return;
    if (!event.currentTarget.classList.contains('is-ready')) return;

    const elapsed = window.performance.now() - intent.startedAt;
    const movement = Math.hypot(event.clientX - intent.x, event.clientY - intent.y);
    if (elapsed < 24 || movement > 18) return;

    enterRef.current();
  };

  return (
    <div ref={overlayRef} id="intro-gate" aria-label="Portfolio entrance">
      {ringLetters.map((letters, ringIndex) => (
        <div
          key={RINGS[ringIndex]}
          ref={(node) => {
            ringsRef.current[ringIndex] = node;
          }}
          className={`intro-gate-ring intro-gate-ring-${ringIndex + 1}`}
          aria-hidden="true"
        >
          {letters.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              style={{ transform: `rotate(${(360 / letters.length) * index}deg) translateY(var(--intro-ring-radius))` }}
            >
              {letter}
            </span>
          ))}
        </div>
      ))}
      <div
        ref={logoRef}
        className="intro-gate-logo"
        role="button"
        aria-label="Enter portfolio"
        onPointerDown={handleLogoPointerDown}
        onPointerUp={handleLogoPointerUp}
        onPointerCancel={clearPointerIntent}
        onPointerLeave={clearPointerIntent}
      >
        <video
          ref={videoRef}
          className="intro-gate-logo-video"
          src="/personal-logo-hover.webm"
          poster="/personal-logo-hover-poster.png"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
