import { forwardRef, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';

export type PageTransitionOverlayHandle = {
  play: (onCovered: () => void) => Promise<void>;
};

const PageTransitionOverlay = forwardRef<PageTransitionOverlayHandle>((_, ref) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(false);

  useImperativeHandle(ref, () => ({
    play(onCovered) {
      const overlay = overlayRef.current;
      const text = textRef.current;

      if (!overlay || !text || runningRef.current) {
        onCovered();
        return Promise.resolve();
      }

      runningRef.current = true;

      return new Promise<void>((resolve) => {
        gsap.killTweensOf([overlay, text]);
        gsap.set(overlay, { '--transition-y': '100%' });
        gsap.set(text, {
          autoAlpha: 1,
          y: 52,
          scaleX: 0.96,
          scaleY: 0.14,
          filter: 'blur(1px)',
          transformOrigin: '50% 100%',
        });

        gsap
          .timeline({
            defaults: { ease: 'power2.inOut' },
            onComplete: () => {
              gsap.set(overlay, { '--transition-y': '100%' });
              gsap.set(text, {
                autoAlpha: 1,
                y: 52,
                scaleX: 0.96,
                scaleY: 0.14,
                filter: 'blur(1px)',
              });
              runningRef.current = false;
              resolve();
            },
          })
          .to(overlay, { '--transition-y': '0%', duration: 0.6 }, 0)
          .to(
            text,
            {
              y: 0,
              scaleX: 1,
              scaleY: 1,
              filter: 'blur(0px)',
              duration: 0.95,
            },
            0,
          )
          .call(onCovered)
          .to({}, { duration: 0.8 })
          .to(
            text,
            {
              y: -42,
              scaleX: 0.98,
              scaleY: 0.18,
              duration: 0.72,
            },
            'exit',
          )
          .to(overlay, { '--transition-y': '-100%', duration: 0.6 }, 'exit');
      });
    },
  }));

  return (
    <div ref={overlayRef} className="page-transition-mask" aria-hidden="true">
      <div ref={textRef} className="page-transition-text">
        DESIGN EVERYDAY. {'\u6bcf\u5929\u3002'}
      </div>
    </div>
  );
});

PageTransitionOverlay.displayName = 'PageTransitionOverlay';

export default PageTransitionOverlay;
