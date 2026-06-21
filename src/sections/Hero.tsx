import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VariableProximity from '../components/VariableProximity';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  scrollProgressRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
  }>;
}

const navItems = [
  { label: '\u5173\u4e8e\u6211', targetId: '\u5173\u4e8e\u6211' },
  { label: '\u4f5c\u54c1', targetId: '\u4f5c\u54c1' },
  { label: '\u9879\u76ee', targetId: '\u9879\u76ee' },
];

const titleLetterOffsets = ['0em', '-0.018em', '-0.012em', '-0.022em', '-0.006em', '0.006em'];

export default function Hero({ scrollProgressRef, mouseRef }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null!);
  const titleRef = useRef<HTMLDivElement>(null!);
  const subtitleRef = useRef<HTMLDivElement>(null!);
  const textProximityRef = useRef<HTMLDivElement>(null!);
  const navRef = useRef<HTMLElement>(null!);
  const titleText = 'AmanaP';

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
        y: -92,
        opacity: 0,
        scale: 1.045,
        filter: 'blur(13px)',
        letterSpacing: '0.012em',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '34% top',
          scrub: 0.5,
        },
      });

      gsap.to(subtitleRef.current, {
        y: -70,
        opacity: 0,
        scale: 0.96,
        filter: 'blur(10px)',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: '4% top',
          end: '30% top',
          scrub: 0.5,
        },
      });

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
  }, [scrollProgressRef, mouseRef]);

  return (
    <section ref={containerRef} className="relative w-full" style={{ height: '100vh' }}>
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
              maxWidth: '1080px',
              padding: '11px 20px 11px 24px',
            }}
          >
            <a
              href="#"
              className="font-bold tracking-tight"
              style={{
                fontSize: 'clamp(0.95rem, 1.2vw, 1.08rem)',
                fontFamily: "'Inter', sans-serif",
                color: 'rgba(255, 255, 255, 0.94)',
                textDecoration: 'none',
                letterSpacing: '-0.015em',
              }}
            >
              AmanaP
            </a>

            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.targetId}
                  href={`#${item.targetId}`}
                  onClick={handleNavClick(item.targetId)}
                  className="relative transition-colors duration-300"
                  style={{
                    fontSize: '0.78rem',
                    fontFamily: "'Inter', sans-serif",
                    color: 'rgba(232, 238, 255, 0.56)',
                    textDecoration: 'none',
                    letterSpacing: '0.08em',
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

            <div className="space-nav-orbit flex items-center justify-center rounded-full">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(216, 226, 255, 0.76)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              </svg>
            </div>
          </div>
        </nav>

        <div
          ref={textProximityRef}
          className="absolute inset-0 flex flex-col items-center justify-center -translate-y-12 md:-translate-y-20"
        >
          <div ref={titleRef} className="text-center md:-translate-x-8">
            <h1 className="space-hero-heading" aria-label={titleText}>
              <VariableProximity
                label={titleText}
                containerRef={textProximityRef}
                fromFontVariationSettings="'wght' 700"
                toFontVariationSettings="'wght' 900"
                radius={150}
                falloff="gaussian"
                letterClassName="space-hero-letter"
                getLetterStyle={(index) => ({
                  animationDelay: `${500 + index * 130}ms`,
                  marginLeft: titleLetterOffsets[index],
                })}
              />
            </h1>
          </div>

          <div ref={subtitleRef} className="space-hero-subtitle text-center md:-translate-x-8">
            <p className="space-hero-kicker font-medium uppercase">
              <VariableProximity
                label={'\u54c1\u724c\u8bbe\u8ba1\u4f5c\u54c1\u96c6'}
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
