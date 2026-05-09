import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

const RINGS = [
  'AMANAP  BRAND DESIGN PORTFOLIO  ',
  'CREATIVE VISION  VISUAL IDENTITY  ',
  'SELECTED WORKS  STRATEGY  DESIGN  ',
];

export default function IntroGate() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<Array<HTMLDivElement | null>>([]);
  const counterRef = useRef<HTMLButtonElement>(null);

  const ringLetters = useMemo(() => RINGS.map((item) => item.repeat(2).split('')), []);

  useEffect(() => {
    const overlay = overlayRef.current;
    const rings = ringsRef.current.filter(Boolean) as HTMLDivElement[];
    const counter = counterRef.current;
    if (!overlay || !rings.length || !counter) return;

    const countState = { value: 0 };
    const idleTweens: gsap.core.Tween[] = [];
    const ctx = gsap.context(() => {
      gsap.set(rings, { transformOrigin: '50% 50%' });
      gsap.set(rings[0], { scale: 3.1, rotate: -12 });
      gsap.set(rings[1], { scale: 2.55, rotate: 18 });
      gsap.set(rings[2], { scale: 2.05, rotate: -28 });
      gsap.set(counter, { pointerEvents: 'none' });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          counter.textContent = 'ENTER';
          counter.classList.add('is-ready');
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
          gsap.to(counter, {
            letterSpacing: '0.18em',
            scale: 1.04,
            duration: 0.55,
            ease: 'power2.out',
            onComplete: () => {
              counter.style.pointerEvents = 'auto';
            },
          });
        },
      });

      tl.to(countState, {
        value: 100,
        duration: 2.45,
        ease: 'power2.out',
        onUpdate: () => {
          counter.textContent = `${Math.round(countState.value)}%`;
        },
      }, 0);

      tl.to(rings[0], {
        rotate: 348,
        duration: 2.45,
        ease: 'none',
      }, 0);

      tl.to(rings[0], {
        scale: 1,
        duration: 2.45,
        ease: 'power3.inOut',
      }, 0);

      tl.to(rings[1], {
        rotate: -342,
        duration: 2.45,
        ease: 'none',
      }, 0);

      tl.to(rings[1], {
        scale: 0.78,
        duration: 2.45,
        ease: 'power3.inOut',
      }, 0);

      tl.to(rings[2], {
        rotate: 332,
        duration: 2.45,
        ease: 'none',
      }, 0);

      tl.to(rings[2], {
        scale: 0.58,
        duration: 2.45,
        ease: 'power3.inOut',
      }, 0);
    }, overlay);

    const enter = () => {
      if (!counter.classList.contains('is-ready')) return;
      counter.style.pointerEvents = 'none';
      idleTweens.forEach((tween) => tween.kill());

      gsap.to(counter, {
        autoAlpha: 0,
        scale: 0.92,
        duration: 0.4,
        ease: 'power3.inOut',
      });

      gsap.to(rings, {
        autoAlpha: 0,
        scale: (index) => [1.08, 0.9, 0.72][index] ?? 1,
        duration: 0.55,
        ease: 'power3.inOut',
      });

      gsap.to(overlay, {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        duration: 1.25,
        delay: 0.18,
        ease: 'power2.inOut',
        onStart: () => {
          window.dispatchEvent(new CustomEvent('portfolio-enter'));
        },
        onComplete: () => {
          overlay.remove();
        },
      });
    };

    counter.addEventListener('click', enter);

    return () => {
      idleTweens.forEach((tween) => tween.kill());
      counter.removeEventListener('click', enter);
      ctx.revert();
    };
  }, []);

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
      <button ref={counterRef} className="intro-gate-counter" type="button">
        0%
      </button>
    </div>
  );
}
