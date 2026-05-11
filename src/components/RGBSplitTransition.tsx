import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const TARGET_SELECTOR = '[data-rgb-split-target="true"]';

export default function RGBSplitTransition() {
  const redOffsetRef = useRef<SVGFEOffsetElement>(null);
  const blueOffsetRef = useRef<SVGFEOffsetElement>(null);

  useEffect(() => {
    const redOffset = redOffsetRef.current;
    const blueOffset = blueOffsetRef.current;
    if (!redOffset || !blueOffset) return undefined;

    let activeTween: gsap.core.Timeline | null = null;
    let fallbackTimeout = 0;

    const getTargets = () => Array.from(document.querySelectorAll<HTMLElement>(TARGET_SELECTOR));

    const setOffsets = (amount: number) => {
      redOffset.setAttribute('dx', String(amount));
      redOffset.setAttribute('dy', String(-amount * 0.22));
      blueOffset.setAttribute('dx', String(-amount));
      blueOffset.setAttribute('dy', String(amount * 0.18));
    };

    const clearEffect = () => {
      window.clearTimeout(fallbackTimeout);
      activeTween?.kill();
      activeTween = null;
      setOffsets(0);
      getTargets().forEach((target) => {
        target.classList.remove('rgb-split-active');
        target.style.removeProperty('--rgb-split-blur');
      });
    };

    const startEffect = () => {
      clearEffect();
      const state = { amount: 0, blur: 0 };
      const targets = getTargets();
      targets.forEach((target) => target.classList.add('rgb-split-active'));

      activeTween = gsap
        .timeline({
          defaults: { ease: 'power3.inOut' },
          onUpdate: () => {
            setOffsets(state.amount);
            targets.forEach((target) => {
              target.style.setProperty('--rgb-split-blur', `${state.blur}px`);
            });
          },
          onComplete: clearEffect,
        })
        .to(state, { amount: 9, blur: 1.3, duration: 0.38, ease: 'power3.out' })
        .to(state, { amount: 4.5, blur: 0.55, duration: 0.62, ease: 'sine.inOut' })
        .to(state, { amount: 0, blur: 0, duration: 0.58, ease: 'power3.inOut' });

      fallbackTimeout = window.setTimeout(clearEffect, 1900);
    };

    window.addEventListener('portfolio-enter', startEffect);
    window.addEventListener('earth-hero-visible', clearEffect);

    return () => {
      window.removeEventListener('portfolio-enter', startEffect);
      window.removeEventListener('earth-hero-visible', clearEffect);
      clearEffect();
    };
  }, []);

  return (
    <svg className="rgb-split-filter" aria-hidden="true" focusable="false">
      <filter id="rgb-split-filter">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="red"
        />
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="green"
        />
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
          result="blue"
        />
        <feOffset ref={redOffsetRef} in="red" dx="0" dy="0" result="redOffset" />
        <feOffset ref={blueOffsetRef} in="blue" dx="0" dy="0" result="blueOffset" />
        <feBlend in="redOffset" in2="green" mode="screen" result="redGreen" />
        <feBlend in="redGreen" in2="blueOffset" mode="screen" />
      </filter>
    </svg>
  );
}
