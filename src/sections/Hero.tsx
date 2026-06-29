import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VariableProximity from '../components/VariableProximity';

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
}

const navItems = [
  { label: 'ABOUT', targetId: '\u5173\u4e8e\u6211' },
  { label: 'WORKS', targetId: '\u4f5c\u54c1' },
  { label: 'PROJECTS', targetId: '\u9879\u76ee' },
];

export default function Hero({ scrollProgressRef, sceneShellRef, mouseRef }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null!);
  const titleRef = useRef<HTMLDivElement>(null!);
  const subtitleRef = useRef<HTMLDivElement>(null!);
  const transitionRef = useRef<HTMLDivElement>(null!);
  const textProximityRef = useRef<HTMLDivElement>(null!);
  const navRef = useRef<HTMLElement>(null!);
  const titleText = 'AMANAP';

  const handleNavClick = (targetId: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const target = document.getElementById(targetId);
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.pushState(null, '', `#${encodeURIComponent(targetId)}`);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const ctx = gsap.context(() => {
      gsap.to(navRef.current, {
        y: -20,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '30% top',
          scrub: 0.5,
        },
      });

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

  return (
    <section ref={containerRef} className="relative w-full hero-transition-stage" style={{ height: '100vh' }}>
      <div ref={transitionRef} className="hero-subpage-bridge" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        <nav
          ref={navRef}
          className="fixed top-0 left-0 right-0 pointer-events-auto"
          style={{
            zIndex: 20,
            padding: 'clamp(12px, 2vh, 20px) clamp(20px, 4vw, 48px)',
          }}
        >
          <div
            className="space-nav-shell mx-auto flex items-center justify-between rounded-2xl"
            style={{
              maxWidth: '100%',
              padding: '0',
            }}
          >
            <a
              href="#"
              className="font-bold tracking-tight cinematic-nav-brand"
              style={{
                textDecoration: 'none',
              }}
            >
              ODSTUDIO
            </a>

            <div className="hidden md:flex items-center gap-7 cinematic-nav-links">
              {navItems.map((item) => (
                <a
                  key={item.targetId}
                  href={`#${item.targetId}`}
                  onClick={handleNavClick(item.targetId)}
                  className="relative transition-colors duration-300"
                  style={{
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.94)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(232, 238, 255, 0.56)';
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="space-nav-orbit flex items-center justify-center rounded-full">NASA</div>
          </div>
        </nav>

        <div ref={textProximityRef} className="cinematic-title-stage">
          <div ref={titleRef} className="cinematic-title-lockup">
            <h1 className="space-hero-heading" aria-label={titleText}>
              <VariableProximity
                label={titleText}
                containerRef={textProximityRef}
                fromFontVariationSettings="'wght' 500"
                toFontVariationSettings="'wght' 700"
                radius={150}
                falloff="gaussian"
                letterClassName="space-hero-letter"
                getLetterStyle={(index) => ({ animationDelay: `${120 + index * 18}ms` })}
              />
            </h1>
          </div>

          <div ref={subtitleRef} className="space-hero-subtitle">
            <p className="space-hero-kicker font-medium uppercase">
              <VariableProximity
                label={'SMART-EARTH-PROTECTION'}
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
                label="Brand Design Portfolio"
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
  );
}
