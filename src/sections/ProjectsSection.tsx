import { useCallback, useRef, useEffect, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft } from 'lucide-react';
import SplitText from '../components/SplitText';
import TargetCursor from '../components/TargetCursor';
import BorderGlow from '../components/BorderGlow';
import SectionParticleEffect from '../components/SectionParticleEffect';
import { DottedSurface } from '@/components/ui/dotted-surface';
import ProjectDetailGallery, { preloadProjectDetailImages } from './ProjectDetailGallery';
import cursorAmaMark from '@/assets/project-detail/cursor-ama-mark.png';

gsap.registerPlugin(ScrollTrigger);

type ParticleMode = 'idle' | 'active' | 'explode' | 'hidden';
type DetailLenisEvent = { velocity?: number };
type DetailLenisInstance = {
  destroy: () => void;
  on: (event: 'scroll', callback: (event: DetailLenisEvent) => void) => void;
  raf: (time: number) => void;
};
type ProjectCardRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

const projects = [
  {
    title: '\u54c1\u724c\u89c6\u89c9\u7115\u65b0',
    desc: '\u56f4\u7ed5\u54c1\u724c\u5b9a\u4f4d\u3001\u6807\u5fd7\u7cfb\u7edf\u3001\u8272\u5f69\u8bed\u8a00\u4e0e\u7248\u5f0f\u89c4\u8303\u5efa\u7acb\u5b8c\u6574\u89c6\u89c9\u8bc6\u522b\uff0c\u8ba9\u54c1\u724c\u62e5\u6709\u53ef\u5ef6\u5c55\u7684\u5546\u4e1a\u8868\u8fbe\u3002',
    tags: ['Brand Strategy', 'Logo System', 'Visual Identity'],
    year: '01',
  },
  {
    title: '\u5305\u88c5\u4e0e\u7269\u6599\u8bbe\u8ba1',
    desc: '\u4ece\u4ea7\u54c1\u5305\u88c5\u5230\u7ebf\u4e0b\u89e6\u70b9\uff0c\u5efa\u7acb\u5177\u6709\u843d\u5730\u611f\u7684\u89c6\u89c9\u7269\u6599\u7cfb\u7edf\uff0c\u8ba9\u54c1\u724c\u5728\u771f\u5b9e\u6d88\u8d39\u573a\u666f\u91cc\u4fdd\u6301\u7edf\u4e00\u8bc6\u522b\u3002',
    tags: ['Packaging', 'Collateral', 'Production'],
    year: '02',
  },
  {
    title: '\u89c6\u89c9\u89c4\u8303\u624b\u518c',
    desc: '\u5c06\u8bbe\u8ba1\u8bed\u8a00\u62c6\u89e3\u4e3a\u53ef\u6267\u884c\u7684\u89c4\u5219\uff0c\u5305\u62ec\u6807\u5fd7\u7528\u6cd5\u3001\u8272\u5f69\u6bd4\u4f8b\u3001\u5b57\u4f53\u5c42\u7ea7\u3001\u56fe\u5f62\u8d44\u4ea7\u548c\u5e94\u7528\u793a\u4f8b\u3002',
    tags: ['Guidelines', 'Design System', 'Manual'],
    year: '03',
  },
  {
    title: 'IP \u5f62\u8c61\u8bbe\u8ba1',
    desc: '\u4ee5\u89d2\u8272\u8bbe\u5b9a\u3001\u9020\u578b\u8bed\u8a00\u548c\u8868\u60c5\u4f53\u7cfb\u6784\u5efa\u54c1\u724c\u4eba\u683c\uff0c\u8ba9\u54c1\u724c\u53d9\u4e8b\u62e5\u6709\u66f4\u5177\u8bb0\u5fc6\u70b9\u7684\u89c6\u89c9\u8f7d\u4f53\u3002',
    tags: ['Character', 'Mascot', 'Storytelling'],
    year: '04',
  },
];

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLDivElement>(null!);
  const headingRef = useRef<HTMLDivElement>(null!);
  const listRef = useRef<HTMLDivElement>(null!);
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const detailScrollRef = useRef<HTMLDivElement>(null);
  const detailContentRef = useRef<HTMLDivElement>(null);
  const detailCursorRef = useRef<HTMLDivElement>(null);
  const particleResetTimerRef = useRef<number | null>(null);
  const dragStateRef = useRef({ currentY: 0, dragging: false, pointerId: -1, startY: 0 });
  const activeCardRectRef = useRef<ProjectCardRect | null>(null);
  const closingRef = useRef(false);
  const [activeProject, setActiveProject] = useState<(typeof projects)[number] | null>(null);
  const [particleMode, setParticleMode] = useState<ParticleMode>('idle');
  const [projectSheetReady, setProjectSheetReady] = useState(false);

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
        }, 3400);
      }
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 88%',
        end: 'bottom 88%',
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
        },
      );

      const items = listRef.current?.children;
      if (items) {
        gsap.fromTo(
          items,
          { y: 70, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: listRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      }
    }, sectionRef);

    return () => {
      if (particleResetTimerRef.current) {
        window.clearTimeout(particleResetTimerRef.current);
        particleResetTimerRef.current = null;
      }
      ctx.revert();
    };
  }, []);

  const openProjectSheet = useCallback((project: (typeof projects)[number], sourceElement: HTMLElement) => {
    const rect = sourceElement.getBoundingClientRect();
    activeCardRectRef.current = {
      height: rect.height,
      left: rect.left,
      top: rect.top,
      width: rect.width,
    };
    setProjectSheetReady(false);
    setActiveProject(project);
  }, []);

  const closeProjectSheet = useCallback(() => {
    if (closingRef.current) return;

    const modal = modalRef.current;
    const backdrop = backdropRef.current;
    if (!modal) {
      setActiveProject(null);
      return;
    }

    closingRef.current = true;
    setProjectSheetReady(false);
    gsap.killTweensOf([modal, backdrop]);

    const rect = activeCardRectRef.current;
    const target = rect
      ? {
          borderRadius: 14,
          scaleX: rect.width / Math.max(window.innerWidth, 1),
          scaleY: rect.height / Math.max(window.innerHeight, 1),
          x: rect.left,
          y: rect.top,
        }
      : {
          borderRadius: 14,
          scaleX: 1,
          scaleY: 0.94,
          x: 0,
          y: 36,
        };

    gsap
      .timeline({
        defaults: { overwrite: 'auto' },
        onComplete: () => {
          dragStateRef.current = { currentY: 0, dragging: false, pointerId: -1, startY: 0 };
          activeCardRectRef.current = null;
          closingRef.current = false;
          setActiveProject(null);
        },
      })
      .to(
        backdrop,
        {
          autoAlpha: 0,
          duration: 0.28,
          ease: 'power2.out',
        },
        0,
      )
      .to(
        modal,
        {
          autoAlpha: 0,
          borderRadius: target.borderRadius,
          scaleX: target.scaleX,
          scaleY: target.scaleY,
          transformOrigin: 'top left',
          x: target.x,
          y: target.y,
          duration: 0.76,
          ease: 'power4.inOut',
        },
        0,
      );
  }, []);

  useEffect(() => {
    if (!activeProject || !modalRef.current) return;

    closingRef.current = false;

    document.documentElement.classList.add('project-sheet-open');
    document.body.classList.add('project-sheet-open');
    preloadProjectDetailImages().catch(() => undefined);

    gsap.killTweensOf([modalRef.current, backdropRef.current]);
    gsap.set(backdropRef.current, { autoAlpha: 1 });

    const startRect = activeCardRectRef.current;
    gsap.set(modalRef.current, {
      autoAlpha: 0,
      borderRadius: startRect ? 14 : 0,
      scaleX: startRect ? startRect.width / Math.max(window.innerWidth, 1) : 1,
      scaleY: startRect ? startRect.height / Math.max(window.innerHeight, 1) : 1,
      transformOrigin: 'top left',
      x: startRect?.left ?? 0,
      y: startRect?.top ?? window.innerHeight,
    });

    gsap.to(modalRef.current, {
      autoAlpha: 1,
      borderRadius: 0,
      scaleX: 1,
      scaleY: 1,
      x: 0,
      y: 0,
      duration: 0.86,
      ease: 'power4.inOut',
      onComplete: () => {
        gsap.set(modalRef.current, { transformOrigin: 'bottom center' });
        setProjectSheetReady(true);
      },
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeProjectSheet();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.documentElement.classList.remove('project-sheet-open');
      document.body.classList.remove('project-sheet-open');
      setProjectSheetReady(false);
      window.removeEventListener('keydown', handleKeyDown);
      gsap.killTweensOf([modalRef.current, backdropRef.current]);
    };
  }, [activeProject, closeProjectSheet]);

  useEffect(() => {
    if (!activeProject || !projectSheetReady || !detailScrollRef.current || !detailContentRef.current) return;

    const LenisConstructor = Lenis as unknown as new (options: Record<string, unknown>) => DetailLenisInstance;
    const lenis = new LenisConstructor({
      content: detailContentRef.current,
      duration: 1.15,
      easing: (value: number) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.4,
      wheelMultiplier: 0.9,
      wrapper: detailScrollRef.current,
    });

    const cards = gsap.utils.toArray<HTMLElement>('.project-gallery-card', detailContentRef.current);
    const skewTo = cards.map((card) =>
      gsap.quickTo(card, 'skewY', {
        duration: 0.42,
        ease: 'power3.out',
      }),
    );

    const handleScroll = ({ velocity = 0 }: DetailLenisEvent) => {
      const skew = gsap.utils.clamp(-8, 8, -velocity * 0.28);
      skewTo.forEach((setSkew) => setSkew(skew));
      gsap.to(cards, {
        skewY: 0,
        duration: 0.68,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };

    cards.forEach((card) => {
      gsap.set(card, {
        transformOrigin: '50% 50%',
        willChange: 'transform',
      });
    });

    lenis.on('scroll', handleScroll);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);

    return () => {
      gsap.ticker.remove(updateLenis);
      gsap.killTweensOf(cards);
      lenis.destroy();
    };
  }, [activeProject, projectSheetReady]);

  useEffect(() => {
    if (!activeProject || !detailCursorRef.current || !modalRef.current) return;

    const cursor = detailCursorRef.current;
    const modal = modalRef.current;
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.46, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.46, ease: 'power3.out' });
    const scaleTo = gsap.quickTo(cursor, 'scale', { duration: 0.28, ease: 'power3.out' });

    const handleMouseMove = (event: MouseEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
    };

    const handleImageHover = (event: Event) => {
      const isHovering = Boolean((event as CustomEvent<boolean>).detail);
      cursor.classList.toggle('is-active', isHovering);
      scaleTo(isHovering ? 1 : 0.34);
    };

    window.addEventListener('mousemove', handleMouseMove);
    modal.addEventListener('project-image-hover', handleImageHover);
    gsap.set(cursor, { scale: 0.34, xPercent: -50, yPercent: -50 });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      modal.removeEventListener('project-image-hover', handleImageHover);
    };
  }, [activeProject]);

  const handleSheetPointerDown = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (!modalRef.current || closingRef.current || event.button !== 0) return;

    dragStateRef.current = {
      currentY: 0,
      dragging: true,
      pointerId: event.pointerId,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    gsap.killTweensOf(modalRef.current);
  }, []);

  const handleSheetPointerMove = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState.dragging || dragState.pointerId !== event.pointerId || !modalRef.current) return;

    const currentY = Math.max(0, event.clientY - dragState.startY);
    dragState.currentY = currentY;
    const compression = Math.min(currentY / Math.max(window.innerHeight, 1), 0.035);
    gsap.set(modalRef.current, {
      scaleY: 1 - compression,
      transformOrigin: 'bottom center',
      y: currentY,
    });
  }, []);

  const handleSheetPointerEnd = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      const dragState = dragStateRef.current;
      if (!dragState.dragging || dragState.pointerId !== event.pointerId || !modalRef.current) return;

      dragState.dragging = false;
      event.currentTarget.releasePointerCapture(event.pointerId);

      if (dragState.currentY > Math.min(140, window.innerHeight * 0.14)) {
        closeProjectSheet();
        return;
      }

      gsap.to(modalRef.current, {
        scaleY: 1,
        y: 0,
        duration: 0.36,
        ease: 'back.out(1.2)',
        overwrite: 'auto',
      });
    },
    [closeProjectSheet],
  );

  const handleSheetHandleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();

      if (dragStateRef.current.currentY > 8) {
        dragStateRef.current.currentY = 0;
        return;
      }

      closeProjectSheet();
    },
    [closeProjectSheet],
  );

  return (
    <section
      id="\u9879\u76ee"
      ref={sectionRef}
      className="relative w-full"
      style={{ minHeight: '100vh', paddingTop: '12vh', paddingBottom: '12vh', zIndex: 10 }}
    >
      <TargetCursor scopeRef={sectionRef} targetSelector=".cursor-target" />
      <div
        className="grid items-center gap-12 px-6 md:grid-cols-[minmax(0,1fr)_minmax(520px,52vw)] md:gap-4 md:px-10 lg:px-12 xl:px-14"
        style={{ width: '100%', maxWidth: 'none' }}
      >
        <div className="relative hidden min-h-[760px] overflow-visible md:block">
          <SectionParticleEffect
            mode={particleMode}
            sourceImage="/particle-project-source.png"
            className="section-particle-effect--projects"
            pointSize={78}
            explodeSpeed={0.023}
          />
        </div>

        <div style={{ maxWidth: '980px', justifySelf: 'end', width: '100%' }}>
          <div ref={headingRef} className="mb-10 text-right">
            <SplitText
              tag="p"
              text="Portfolio"
              className="uppercase tracking-[0.3em] mb-4"
              delay={34}
              duration={0.7}
              splitType="chars"
              threshold={0.2}
              rootMargin="-80px"
              textAlign="right"
              style={{
                fontSize: '0.75rem',
                fontFamily: "'JetBrains Mono', monospace",
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            />
            <SplitText
              tag="h2"
              text={"\u7cfb\u7edf\u5316\u7684\u54c1\u724c\u9879\u76ee"}
              className="text-white font-bold"
              delay={48}
              duration={0.82}
              ease="power3.out"
              splitType="chars"
              threshold={0.2}
              rootMargin="-80px"
              textAlign="right"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            />
          </div>

          <div ref={listRef} className="space-y-4">
            {projects.map((project, i) => (
              <BorderGlow
                key={project.year}
                className="project-list-card cursor-target group transition-all duration-300"
                edgeSensitivity={26}
                glowColor="230 84 76"
                backgroundColor="rgba(10, 10, 18, 0.52)"
                borderRadius={14}
                glowRadius={42}
                glowIntensity={1.05}
                coneSpread={24}
                animated={i === 0}
                fillOpacity={0}
                colors={['#c084fc', '#f472b6', '#fb7185']}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                onClick={(event) => openProjectSheet(project, event.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openProjectSheet(project, e.currentTarget);
                  }
                }}
              >
                <div className="flex flex-col md:items-end gap-4 p-6 text-right md:p-8">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center justify-end gap-4">
                      <h3
                        className="font-semibold text-white"
                        style={{
                          fontSize: '1.25rem',
                          fontFamily: "'Inter', sans-serif",
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {project.title}
                      </h3>
                      <span
                        className="text-xs"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: 'rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        {project.year}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.55)',
                        fontFamily: "'Inter', sans-serif",
                        lineHeight: 1.65,
                        maxWidth: '600px',
                        marginLeft: 'auto',
                      }}
                    >
                      {project.desc}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-3 py-1 text-xs"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          background: 'rgba(244, 114, 182, 0.12)',
                          color: 'rgba(255, 211, 220, 0.86)',
                          border: '1px solid rgba(244, 114, 182, 0.22)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </BorderGlow>
            ))}
          </div>
        </div>
      </div>

      {activeProject && (
        <div ref={backdropRef} className="project-modal-backdrop" onClick={closeProjectSheet}>
          <div
            ref={modalRef}
            className="project-floating-card project-bottom-sheet"
            data-lenis-prevent
            onClick={(event) => event.stopPropagation()}
          >
            {projectSheetReady && (
              <DottedSurface className="project-detail-dotted-surface" />
            )}
            <button
              type="button"
              className="project-sheet-handle"
              aria-label="Exit project details"
              onClick={handleSheetHandleClick}
              onPointerCancel={handleSheetPointerEnd}
              onPointerDown={handleSheetPointerDown}
              onPointerMove={handleSheetPointerMove}
              onPointerUp={handleSheetPointerEnd}
            >
              <span />
            </button>
            <button
              type="button"
              className="project-modal-exit"
              onClick={closeProjectSheet}
              aria-label="Exit project details"
            >
              <ArrowLeft aria-hidden="true" />
              <span>{'\u9000\u51fa'}</span>
            </button>

            <div ref={detailScrollRef} className="project-sheet-scroll">
              <div ref={detailContentRef} className="project-sheet-content">
                <ProjectDetailGallery ariaLabel={`${activeProject.title} project images`} />
              </div>
            </div>
            <div ref={detailCursorRef} className="project-detail-cursor" aria-hidden="true">
              <img src={cursorAmaMark} alt="" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
