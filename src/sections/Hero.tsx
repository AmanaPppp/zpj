import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

export default function Hero({ scrollProgressRef, mouseRef }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null!);
  const titleRef = useRef<HTMLDivElement>(null!);
  const subtitleRef = useRef<HTMLDivElement>(null!);
  const navRef = useRef<HTMLElement>(null!);

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
        y: -60,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '30% top',
          scrub: 0.5,
        },
      });

      gsap.to(subtitleRef.current, {
        y: -40,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: '8% top',
          end: '28% top',
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
      gsap.to([navRef.current, titleRef.current, subtitleRef.current], {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power2.out',
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
            className="mx-auto flex items-center justify-between rounded-2xl"
            style={{
              maxWidth: '1200px',
              padding: '14px 28px',
              background: 'rgba(255, 255, 255, 0.08)',
              backgroundImage:
                'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
              backdropFilter: 'blur(60px) saturate(200%)',
              WebkitBackdropFilter: 'blur(60px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow:
                '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            }}
          >
            <a
              href="#"
              className="font-bold tracking-tight"
              style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                fontFamily: "'Inter', sans-serif",
                color: '#ffffff',
                textDecoration: 'none',
                letterSpacing: '-0.02em',
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
                    fontSize: '0.85rem',
                    fontFamily: "'Inter', sans-serif",
                    color: 'rgba(255, 255, 255, 0.6)',
                    textDecoration: 'none',
                    letterSpacing: '0.02em',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, rgba(92, 107, 192, 0.3), rgba(159, 168, 218, 0.2))',
                border: '1px solid rgba(92, 107, 192, 0.3)',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(159, 168, 218, 0.8)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              </svg>
            </div>
          </div>
        </nav>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div ref={titleRef} className="text-center">
            <h1
              className="text-white font-extrabold tracking-tight"
              style={{
                fontSize: 'clamp(3rem, 10vw, 8rem)',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                textShadow: '0 0 60px rgba(92, 107, 192, 0.3)',
              }}
            >
              AmanaP
            </h1>
          </div>

          <div ref={subtitleRef} className="text-center mt-2">
            <p
              className="font-medium tracking-[0.2em] uppercase"
              style={{
                fontSize: 'clamp(0.8rem, 1.5vw, 1.2rem)',
                fontFamily: "'JetBrains Mono', monospace",
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              品牌设计作品集
            </p>
            <p
              className="mt-1 tracking-[0.35em] uppercase"
              style={{
                fontSize: 'clamp(0.6rem, 1.2vw, 0.85rem)',
                fontFamily: "'JetBrains Mono', monospace",
                color: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              Brand Design Portfolio
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
