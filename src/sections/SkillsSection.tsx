import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import InfiniteFluidPosterWall from '../components/InfiniteFluidPosterWall';

gsap.registerPlugin(ScrollTrigger);

const accent = '#761e3c';
const accentGradient = 'linear-gradient(to top, #761e3c 0%, #721b39 18%, #6a1935 34%, #5e162f 50%, #4e1227 66%, #390d1d 82%, #21070f 100%, #000000 135%)';

function StartArrow({ variant }: { variant: 'left' | 'center' | 'right' }) {
  const config = {
    left: {
      width: 'clamp(180px, 20.4vw, 286px)',
      height: 'clamp(166px, 18vw, 262px)',
      rotate: '-36deg',
      tipLeft: '38%',
      tipTop: '49%',
    },
    center: {
      width: 'clamp(115px, 13.2vw, 182px)',
      height: 'clamp(168px, 18vw, 269px)',
      rotate: '0deg',
      tipLeft: '50%',
      tipTop: '48%',
    },
    right: {
      width: 'clamp(180px, 20.4vw, 286px)',
      height: 'clamp(166px, 18vw, 262px)',
      rotate: '36deg',
      tipLeft: '62%',
      tipTop: '49%',
    },
  }[variant];

  return (
    <div
      className="start-arrow"
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: config.tipLeft,
        top: config.tipTop,
        transform: `rotate(${config.rotate})`,
        transformOrigin: '0 0',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: config.width,
          height: config.height,
          transform: 'translate(-50%, -100%)',
          transformOrigin: '50% 100%',
        }}
      >
        <div
          className="start-arrow-shape"
          style={{
            width: '100%',
            height: '100%',
            background: '#fff',
            clipPath: 'polygon(34% 0, 66% 0, 66% 58%, 86% 58%, 50% 100%, 14% 58%, 34% 58%)',
            transform: 'scaleY(0)',
            transformOrigin: '50% 100%',
          }}
        />
      </div>
    </div>
  );
}

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const buttonLabelRef = useRef<HTMLSpanElement>(null);
  const portalOverlayRef = useRef<HTMLDivElement>(null);
  const portalContentRef = useRef<HTMLDivElement>(null);
  const returnButtonRef = useRef<HTMLButtonElement>(null);
  const portalTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const isPortalAnimatingRef = useRef(false);
  const scrollLockRef = useRef<{
    scrollY: number;
    htmlOverflow: string;
    bodyOverflow: string;
    bodyPosition: string;
    bodyTop: string;
    bodyWidth: string;
  } | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [isStartHovered, setIsStartHovered] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const arrows = Array.from(stage.querySelectorAll<HTMLElement>('.start-arrow-shape'));
    const arrowFrames = Array.from(stage.querySelectorAll<HTMLElement>('.start-arrow'));
    const button = stage.querySelector<HTMLElement>('.start-button');
    if (arrows.length !== 3 || !button) return;
    let hasPlayedStartCue = false;

    const ctx = gsap.context(() => {
      const resetStartCue = () => {
        gsap.set(arrows, { autoAlpha: 0, scaleY: 0 });
        gsap.set(arrowFrames, { y: 0 });
        gsap.set(button, { autoAlpha: 0, scale: 0.74, y: 30 });
      };

      resetStartCue();

      const timeline = gsap
        .timeline({ paused: true })
        .to(arrows, {
          autoAlpha: 1,
          scaleY: 1,
          duration: 1.08,
          ease: 'back.out(2.2)',
          stagger: {
            each: 0.16,
            from: 'center',
          },
        })
        .to(
          arrowFrames,
          {
            y: -18,
            duration: 0.22,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
            stagger: {
              each: 0.06,
              from: 'center',
            },
          },
          '-=0.18',
        )
        .to(
          button,
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.78,
            ease: 'bounce.out',
          },
          '-=0.26',
        );

      ScrollTrigger.create({
        trigger: stage,
        start: 'top 72%',
        end: 'bottom 18%',
        onEnter: () => {
          if (hasPlayedStartCue) return;
          hasPlayedStartCue = true;
          resetStartCue();
          timeline.restart();
        },
        onEnterBack: () => {
          if (hasPlayedStartCue) return;
          hasPlayedStartCue = true;
          resetStartCue();
          timeline.restart();
        },
        onLeaveBack: () => {
          if (hasPlayedStartCue) return;
          timeline.pause(0);
          resetStartCue();
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  useEffect(() => {
    return () => {
      portalTimelineRef.current?.kill();
      releasePortalScroll();
    };
  }, []);

  const releasePortalScroll = () => {
    const lock = scrollLockRef.current;
    if (!lock) return;

    document.documentElement.style.overflow = lock.htmlOverflow;
    document.body.style.overflow = lock.bodyOverflow;
    document.body.style.position = lock.bodyPosition;
    document.body.style.top = lock.bodyTop;
    document.body.style.width = lock.bodyWidth;
    window.scrollTo(0, lock.scrollY);
    scrollLockRef.current = null;
  };

  const lockPortalScroll = () => {
    if (scrollLockRef.current) return;

    const scrollY = window.scrollY;
    scrollLockRef.current = {
      scrollY,
      htmlOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyWidth: document.body.style.width,
    };

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
  };

  const handleStartClick = () => {
    const button = buttonRef.current;
    const label = buttonLabelRef.current;
    const portalOverlay = portalOverlayRef.current;
    const portalContent = portalContentRef.current;
    const stage = stageRef.current;
    if (!button || !label || !portalOverlay || !portalContent || !stage || isPortalAnimatingRef.current) return;

    const buttonRect = button.getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;
    const maxDistanceX = Math.max(centerX, window.innerWidth - centerX);
    const maxDistanceY = Math.max(centerY, window.innerHeight - centerY);
    const zoomScale = Math.max((maxDistanceX * 2) / buttonRect.width, (maxDistanceY * 2) / buttonRect.height) * 1.08;
    const arrows = Array.from(stage.querySelectorAll<HTMLElement>('.start-arrow'));

    portalTimelineRef.current?.kill();
    isPortalAnimatingRef.current = true;
    setIsStartHovered(true);
    setIsPortalOpen(true);
    lockPortalScroll();

    gsap.set(portalOverlay, {
      autoAlpha: 1,
      scale: 1,
      x: 0,
      y: 0,
      left: buttonRect.left,
      top: buttonRect.top,
      width: buttonRect.width,
      height: buttonRect.height,
      borderRadius: 12,
      clipPath: 'inset(0px 0px 0px 0px round 12px)',
      pointerEvents: 'none',
      transformOrigin: '50% 50%',
    });
    gsap.set(portalContent, {
      autoAlpha: 0,
    });
    portalTimelineRef.current = gsap
      .timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          isPortalAnimatingRef.current = false;
          const currentReturnButton = returnButtonRef.current;
          if (currentReturnButton) {
            gsap.to(currentReturnButton, {
              autoAlpha: 1,
              y: 0,
              duration: 0.36,
              ease: 'power2.out',
            });
          }
        },
      })
      .to(label, {
        autoAlpha: 0,
        y: -10,
        duration: 0.1,
        ease: 'power2.out',
      }, 0)
      .to(
        button,
        {
          autoAlpha: 0,
          duration: 0.1,
          ease: 'power1.out',
        },
        0,
      )
      .to(
        arrows,
        {
          autoAlpha: 0,
          y: -18,
          duration: 0.3,
          stagger: { each: 0.04, from: 'center' },
          ease: 'power2.out',
        },
        0,
      )
      .to(
        portalOverlay,
        {
          scale: zoomScale,
          borderRadius: 0,
          duration: 1.12,
          ease: 'expo.inOut',
        },
        0,
      )
      .set(portalOverlay, {
        left: 0,
        top: 0,
        width: '100vw',
        height: '100dvh',
        scale: 1,
        x: 0,
        y: 0,
        clipPath: 'inset(0px 0px 0px 0px round 0px)',
        pointerEvents: 'auto',
      })
      .to(portalContent, {
        autoAlpha: 1,
        duration: 0.24,
        ease: 'power2.out',
      });
  };

  const handleReturnClick = () => {
    const button = buttonRef.current;
    const label = buttonLabelRef.current;
    const portalOverlay = portalOverlayRef.current;
    const portalContent = portalContentRef.current;
    const returnButton = returnButtonRef.current;
    const stage = stageRef.current;
    if (!button || !label || !portalOverlay || !portalContent || !stage || isPortalAnimatingRef.current) return;

    const buttonRect = button.getBoundingClientRect();
    const arrows = Array.from(stage.querySelectorAll<HTMLElement>('.start-arrow'));
    const clipTop = buttonRect.top;
    const clipRight = window.innerWidth - buttonRect.right;
    const clipBottom = window.innerHeight - buttonRect.bottom;
    const clipLeft = buttonRect.left;

    portalTimelineRef.current?.kill();
    isPortalAnimatingRef.current = true;

    gsap.set(portalOverlay, {
      autoAlpha: 1,
      left: 0,
      top: 0,
      width: '100vw',
      height: '100dvh',
      scale: 1,
      x: 0,
      y: 0,
      borderRadius: 0,
      clipPath: 'inset(0px 0px 0px 0px round 0px)',
      pointerEvents: 'none',
      transformOrigin: '50% 50%',
    });
    gsap.set(portalContent, { autoAlpha: 1 });

    portalTimelineRef.current = gsap
      .timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          gsap.set(portalOverlay, {
            autoAlpha: 0,
            scale: 1,
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            clipPath: 'inset(0px 0px 0px 0px round 0px)',
            pointerEvents: 'none',
          });
          gsap.set(portalContent, { autoAlpha: 0 });
          gsap.set(arrows, { autoAlpha: 1, y: 0 });
          gsap.set(button, { autoAlpha: 1, scale: 1, y: 0 });
          gsap.set(label, { autoAlpha: 1, y: 0 });
          setIsPortalOpen(false);
          setIsStartHovered(false);
          releasePortalScroll();
          isPortalAnimatingRef.current = false;
        },
      })
      .to(returnButton, {
        autoAlpha: 0,
        y: -8,
        duration: 0.22,
        ease: 'power2.out',
      })
      .to(
        portalOverlay,
        {
          clipPath: `inset(${clipTop}px ${clipRight}px ${clipBottom}px ${clipLeft}px round 12px)`,
          duration: 1.12,
          ease: 'expo.inOut',
        },
        0,
      )
      .to(
        portalContent,
        {
          autoAlpha: 0,
          duration: 0.36,
          ease: 'power2.out',
        },
        '<0.18',
      )
      .to(portalOverlay, {
        autoAlpha: 0,
        duration: 0.16,
        ease: 'power1.out',
      });
  };

  return (
    <section
      id={'\u4f5c\u54c1'}
      ref={sectionRef}
      className="relative flex w-full items-center justify-center overflow-hidden"
      style={{
        minHeight: '100vh',
        padding: '12vh clamp(24px, 5vw, 72px)',
        zIndex: 10,
      }}
    >
      <div
        ref={stageRef}
        style={{
          position: 'relative',
          width: 'min(100%, 760px)',
          aspectRatio: '1.9',
          minHeight: '260px',
        }}
      >
        <StartArrow variant="left" />
        <StartArrow variant="center" />
        <StartArrow variant="right" />

        <button
          ref={buttonRef}
          type="button"
          className="start-button"
          onMouseEnter={() => setIsStartHovered(true)}
          onMouseLeave={() => setIsStartHovered(false)}
          onFocus={() => setIsStartHovered(true)}
          onBlur={() => setIsStartHovered(false)}
          onClick={handleStartClick}
          style={{
            position: 'absolute',
            left: '50%',
            top: '62%',
            transform: 'translate(-50%, -50%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'max-content',
            padding: 'clamp(6px, 1vw, 10px) clamp(27px, 4.1vw, 41px)',
            border: 0,
            borderRadius: '12px',
            background: isStartHovered ? accentGradient : '#fff',
            color: isStartHovered ? '#fff' : accent,
            fontFamily: "'Swis721 Blk BT', 'Swis721 Blk BT Black', 'Arial Black', 'Montserrat', sans-serif",
            fontSize: 'clamp(41px, 6vw, 70px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '0',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            boxShadow: 'none',
            transition: 'background-color 180ms ease, color 180ms ease',
          }}
        >
          <span ref={buttonLabelRef}>
            {isStartHovered ? '\u771f\u7684\u8981\u70b9\u5417' : 'Start'}
          </span>
        </button>
      </div>

      {portalRoot &&
        createPortal(
          <>
            <div
              ref={portalOverlayRef}
              aria-hidden={!isPortalOpen}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: 0,
                height: 0,
                zIndex: 2147483645,
                pointerEvents: 'none',
                visibility: 'hidden',
                overflow: 'hidden',
                background: accentGradient,
              }}
            >
              <div ref={portalContentRef} className="work-portal-content">
                <InfiniteFluidPosterWall />
              </div>
            </div>
            {isPortalOpen && (
              <button
                ref={returnButtonRef}
                type="button"
                onClick={handleReturnClick}
                style={{
                  position: 'fixed',
                  left: 'clamp(18px, 3vw, 42px)',
                  top: 'clamp(18px, 3vw, 42px)',
                  zIndex: 2147483647,
                  padding: '10px 18px',
                  border: '1px solid rgba(255, 255, 255, 0.72)',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '0',
                  cursor: 'pointer',
                  opacity: 0,
                  visibility: 'hidden',
                  transform: 'translateY(-8px)',
                }}
              >
                返回
              </button>
            )}
          </>,
          portalRoot,
        )}
    </section>
  );
}
