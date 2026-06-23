import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft } from 'lucide-react';
import InfiniteMenu, { type InfiniteMenuItem } from '../components/InfiniteMenu';
import SplitText from '../components/SplitText';
import StellarCardGallerySingle from '../components/ui/3d-image-gallery';
import SectionParticleEffect from '../components/SectionParticleEffect';

gsap.registerPlugin(ScrollTrigger);

type ParticleMode = 'idle' | 'active' | 'explode' | 'hidden';

const portfolioItems = [
  {
    image: '/avatar1.png',
    link: '#',
    title: 'Brand Identity Design',
    description: 'Logo design & brand systems',
  },
  {
    image: '/logo-design-cover.png',
    link: '#',
    title: 'Logo Design',
    description: 'Product & packaging visual',
  },
  {
    image: '/avatar3.png',
    link: '#',
    title: 'Visual Guidelines',
    description: 'Brand standards & manuals',
  },
];

export default function SkillsSection() {
  const sectionRef = useRef<HTMLDivElement>(null!);
  const headingRef = useRef<HTMLDivElement>(null!);
  const menuRef = useRef<HTMLDivElement>(null!);
  const overlayRef = useRef<HTMLDivElement>(null);
  const particleResetTimerRef = useRef<number | null>(null);
  const closingRef = useRef(false);
  const [selectedWork, setSelectedWork] = useState<InfiniteMenuItem | null>(null);
  const [particleMode, setParticleMode] = useState<ParticleMode>('idle');

  useEffect(() => {
    const setMode = (mode: ParticleMode) => {
      if (particleResetTimerRef.current) {
        window.clearTimeout(particleResetTimerRef.current);
        particleResetTimerRef.current = null;
      }

      setParticleMode(mode);

      if (mode === 'explode') {
        particleResetTimerRef.current = window.setTimeout(() => {
          setParticleMode('hidden');
          particleResetTimerRef.current = null;
        }, 5200);
      }
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 58%',
        end: 'bottom 72%',
        onEnter: () => setMode('active'),
        onEnterBack: () => setMode('active'),
        onLeave: () => setMode('explode'),
        onLeaveBack: () => setMode('idle'),
      });

      gsap.fromTo(
        headingRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        menuRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: menuRef.current,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => {
      if (particleResetTimerRef.current) {
        window.clearTimeout(particleResetTimerRef.current);
        particleResetTimerRef.current = null;
      }
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (!selectedWork || !overlayRef.current) return;

    document.body.style.overflow = 'hidden';
    closingRef.current = false;

    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo(
          overlayRef.current,
          {
            autoAlpha: 0,
            clipPath: 'circle(0% at calc(100% - 42px) 42px)',
          },
          {
            autoAlpha: 1,
            clipPath: 'circle(150% at 50% 50%)',
            duration: 0.72,
            ease: 'power3.inOut',
          }
        )
        .fromTo(
          '.work-fullscreen-close',
          { autoAlpha: 0, y: -10, scale: 0.92 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.34, ease: 'back.out(1.8)' },
          '-=0.26'
        );
    }, overlayRef);

    const closeWorkPage = () => {
      if (!overlayRef.current || closingRef.current) return;
      closingRef.current = true;

      gsap
        .timeline({
          onComplete: () => {
            setSelectedWork(null);
          },
        })
        .to('.work-fullscreen-close', {
          autoAlpha: 0,
          y: -8,
          scale: 0.92,
          duration: 0.18,
          ease: 'power2.in',
        })
        .to(
          overlayRef.current,
          {
            autoAlpha: 0,
            clipPath: 'circle(0% at calc(100% - 42px) 42px)',
            duration: 0.58,
            ease: 'power3.inOut',
          },
          0.04
        );
    };

    const closeButton = overlayRef.current.querySelector<HTMLButtonElement>('.work-fullscreen-close');
    closeButton?.addEventListener('click', closeWorkPage);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeWorkPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      closeButton?.removeEventListener('click', closeWorkPage);
      ctx.revert();
    };
  }, [selectedWork]);

  return (
    <section
      id="作品"
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ paddingTop: '18vh', paddingBottom: '18vh', zIndex: 10 }}
    >
      <SectionParticleEffect
        mode={particleMode}
        sourceImage="/particle-portfolio-backdrop-source.png"
        className="section-particle-effect--portfolio-backdrop"
        pointSize={97}
        explodeSpeed={0.012}
        morphSpeed={0.018}
      />

      <div className="relative mx-auto px-6 md:px-12" style={{ maxWidth: '1200px', zIndex: 2 }}>
        <div ref={headingRef} className="mb-8 text-center">
          <SplitText
            tag="p"
            text="Portfolio"
            className="mb-4 uppercase tracking-[0.3em]"
            delay={34}
            duration={0.7}
            splitType="chars"
            threshold={0.2}
            rootMargin="-80px"
            style={{
              fontSize: '0.75rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#9fa8da',
            }}
          />
          <SplitText
            tag="h2"
            text={"\u4f5c\u54c1\u5c55\u793a"}
            className="font-bold"
            delay={56}
            duration={0.82}
            ease="power3.out"
            splitType="chars"
            threshold={0.2}
            rootMargin="-80px"
            style={{
              fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0',
              lineHeight: 1.2,
              color: '#ffffff',
            }}
          />
        </div>

        <div ref={menuRef}>
          <InfiniteMenu items={portfolioItems} scale={1} onOpenItem={setSelectedWork} />
        </div>
      </div>

      {selectedWork && createPortal(
        <div ref={overlayRef} className="work-fullscreen-page">
          <button
            type="button"
            className="work-fullscreen-close"
            aria-label="Close work page"
          >
            <ArrowLeft className="work-fullscreen-close-icon" strokeWidth={1.8} />
            <span>BACK</span>
          </button>

          <StellarCardGallerySingle />
        </div>,
        document.body,
      )}
    </section>
  );
}
