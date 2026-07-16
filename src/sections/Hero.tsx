import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DecryptedText from '../components/DecryptedText';
import VariableProximity from '../components/VariableProximity';
import type { HeroArea } from '../components/HeroNavigationOverlay';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  scrollProgressRef: React.MutableRefObject<number>;
  sceneShellRef: React.RefObject<HTMLDivElement | null>;
  mouseRef: React.MutableRefObject<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
  }>;
  activeHeroArea: HeroArea;
  onHeroAreaChange: (area: HeroArea) => void;
}

const navItems = [
  { label: '\u4e3b\u9875', area: 'home' },
  { label: '\u5408\u96c6', area: 'collection' },
  { label: '\u4e2a\u4eba\u8bbe\u8ba1', area: 'personal' },
] satisfies Array<{ label: string; area: HeroArea }>;

export default function Hero({
  scrollProgressRef,
  sceneShellRef,
  mouseRef,
  activeHeroArea,
  onHeroAreaChange,
}: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null!);
  const titleRef = useRef<HTMLDivElement>(null!);
  const subtitleRef = useRef<HTMLDivElement>(null!);
  const transitionRef = useRef<HTMLDivElement>(null!);
  const textProximityRef = useRef<HTMLDivElement>(null!);
  const navRef = useRef<HTMLElement>(null!);
  const titleText = 'AmanaP-Portfolio';
  const [titleVisible, setTitleVisible] = useState(false);
  const [navExpanded, setNavExpanded] = useState(false);

  const handleAreaClick = (area: HeroArea) => {
    setNavExpanded(true);
    onHeroAreaChange(area);
  };

  useEffect(() => {
    if (!navExpanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (navRef.current?.contains(event.target as Node)) return;
      setNavExpanded(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [navExpanded]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const ctx = gsap.context(() => {
      gsap.to(titleRef.current, {
        y: -76,
        opacity: 0,
        scale: 1.018,
        filter: 'blur(7px)',
        letterSpacing: '-0.044em',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: '8% top',
          end: '42% top',
          scrub: 0.8,
        },
      });

      gsap.to(subtitleRef.current, {
        y: -52,
        opacity: 0,
        scale: 0.98,
        filter: 'blur(6px)',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: '10% top',
          end: '40% top',
          scrub: 0.8,
        },
      });

      gsap.set(transitionRef.current, { autoAlpha: 0 });

      const bridgeTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: '42% top',
          end: 'bottom top',
          scrub: 1.15,
        },
      });

      bridgeTimeline
        .to(transitionRef.current, {
          autoAlpha: 1,
          yPercent: -6,
          ease: 'none',
        }, 0)
        .to(sceneShellRef.current, {
          autoAlpha: 0.22,
          scale: 0.985,
          ease: 'none',
        }, 0.08);

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          scrollProgressRef.current = Math.min(self.progress, 1);
        },
      });
    }, containerRef);

    gsap.set([navRef.current, titleRef.current, subtitleRef.current], {
      autoAlpha: 0,
      pointerEvents: 'none',
    });

    if (sceneShellRef.current) {
      gsap.set(sceneShellRef.current, {
        autoAlpha: 1,
        scale: 1,
        transformOrigin: '50% 50%',
      });
    }

    const showHeroText = () => {
      setTitleVisible(false);
      titleRef.current?.classList.remove('is-title-visible');
      subtitleRef.current?.classList.remove('is-subtitle-visible');

      gsap.to([navRef.current, titleRef.current, subtitleRef.current], {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power2.out',
        onStart: () => {
          window.requestAnimationFrame(() => {
            setTitleVisible(true);
            titleRef.current?.classList.add('is-title-visible');
            subtitleRef.current?.classList.add('is-subtitle-visible');
          });
        },
        onComplete: () => {
          if (navRef.current) {
            navRef.current.style.pointerEvents = 'auto';
          }
        },
      });
    };

    window.addEventListener('earth-hero-visible', showHeroText);

    return () => {
      window.removeEventListener('earth-hero-visible', showHeroText);
      ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [scrollProgressRef, sceneShellRef, mouseRef]);

  const navMarkup = (
    <>
      <nav
        ref={navRef}
        className={`hero-expanded-nav pointer-events-auto ${activeHeroArea === 'home' ? 'is-home' : ''}`}
        aria-label="Portfolio navigation"
      >
        <div className={`hero-expanded-nav-shell ${navExpanded ? 'is-expanded' : ''}`}>
          <button
            type="button"
            className="hero-expanded-nav-trigger"
            onClick={() => setNavExpanded(true)}
            aria-expanded={navExpanded}
            aria-hidden={navExpanded}
            tabIndex={navExpanded ? -1 : 0}
          >
            <span className="hero-expanded-nav-icon">
              <img src="/ama-nav-logo.png" alt="" />
            </span>
            <span>{'\u5bfc\u822a'}</span>
          </button>
          <div className="hero-expanded-nav-items" aria-hidden={!navExpanded}>
            {navItems.map((item) => (
              <button
                key={item.area}
                type="button"
                className={activeHeroArea === item.area ? 'is-active' : ''}
                onClick={() => handleAreaClick(item.area)}
                tabIndex={navExpanded ? 0 : -1}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <div className="space-nav-orbit flex items-center justify-center rounded-full">AMANAP</div>
    </>
  );

  return (
    <>
      {typeof document !== 'undefined' ? createPortal(navMarkup, document.body) : navMarkup}
      <section ref={containerRef} className="relative w-full hero-transition-stage" style={{ height: '100vh' }}>
        <div ref={transitionRef} className="hero-subpage-bridge" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        <div ref={textProximityRef} className="cinematic-title-stage">
          <div ref={titleRef} className="cinematic-title-lockup">
            <h1 className="space-hero-heading" aria-label={titleText}>
              <DecryptedText
                text={titleText}
                animateOn="active"
                active={titleVisible}
                speed={42}
                sequential
                revealDirection="center"
                className="space-hero-letter"
                encryptedClassName="space-hero-letter space-hero-letter-encrypted"
              />
            </h1>
          </div>

          <div ref={subtitleRef} className="space-hero-subtitle">
            <p className="space-hero-kicker font-medium uppercase">
              <VariableProximity
                label="Brand Design Portfolio"
                containerRef={textProximityRef}
                fromFontVariationSettings="'wght' 500"
                toFontVariationSettings="'wght' 800"
                radius={105}
                falloff="linear"
                letterClassName="space-hero-subtitle-letter"
              />
            </p>
            <p className="space-hero-caption mt-2 uppercase">
              <VariableProximity
                label="品牌设计作品集"
                containerRef={textProximityRef}
                fromFontVariationSettings="'wght' 400"
                toFontVariationSettings="'wght' 700"
                radius={105}
                falloff="linear"
                letterClassName="space-hero-subtitle-letter"
              />
            </p>
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
