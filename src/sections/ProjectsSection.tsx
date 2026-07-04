import { useCallback, useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft } from 'lucide-react';
import SplitText from '../components/SplitText';
import TargetCursor from '../components/TargetCursor';
import BorderGlow from '../components/BorderGlow';
import SectionParticleEffect from '../components/SectionParticleEffect';

gsap.registerPlugin(ScrollTrigger);

type ParticleMode = 'idle' | 'active' | 'explode' | 'hidden';

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

const projectDetails: Record<string, { detail: string; scope: string[]; outcome: string }> = {
  '01': {
    detail: '\u56f4\u7ed5\u54c1\u724c\u5b9a\u4f4d\u3001\u6807\u5fd7\u7cfb\u7edf\u3001\u8272\u5f69\u8bed\u8a00\u4e0e\u7248\u5f0f\u89c4\u8303\u5efa\u7acb\u5b8c\u6574\u89c6\u89c9\u8bc6\u522b\uff0c\u5e2e\u52a9\u54c1\u724c\u5728\u5546\u4e1a\u89e6\u70b9\u4e2d\u4fdd\u6301\u7a33\u5b9a\u3001\u6e05\u6670\u4e14\u53ef\u5ef6\u5c55\u7684\u8868\u8fbe\u3002',
    scope: ['\u54c1\u724c\u5b9a\u4f4d\u68b3\u7406', 'Logo \u4e0e\u8bc6\u522b\u7cfb\u7edf', '\u8272\u5f69/\u5b57\u4f53/\u7248\u5f0f\u89c4\u8303', '\u6838\u5fc3\u5e94\u7528\u5ef6\u5c55'],
    outcome: '\u5f62\u6210\u4e00\u5957\u80fd\u591f\u7528\u4e8e\u5b98\u7f51\u3001\u793e\u5a92\u3001\u63d0\u6848\u548c\u7ebf\u4e0b\u7269\u6599\u7684\u54c1\u724c\u89c6\u89c9\u7cfb\u7edf\u3002',
  },
  '02': {
    detail: '\u4ece\u4ea7\u54c1\u5305\u88c5\u5230\u7ebf\u4e0b\u89e6\u70b9\uff0c\u5efa\u7acb\u5177\u6709\u843d\u5730\u611f\u7684\u89c6\u89c9\u7269\u6599\u7cfb\u7edf\uff0c\u8ba9\u54c1\u724c\u5728\u771f\u5b9e\u6d88\u8d39\u573a\u666f\u4e2d\u4fdd\u6301\u7edf\u4e00\u8bc6\u522b\u3002',
    scope: ['\u5305\u88c5\u7ed3\u6784\u89c6\u89c9', '\u7ebf\u4e0b\u6d77\u62a5\u4e0e\u6298\u9875', '\u6750\u8d28\u4e0e\u5de5\u827a\u5efa\u8bae', '\u751f\u4ea7\u4ea4\u4ed8\u89c4\u8303'],
    outcome: '\u63d0\u5347\u4ea7\u54c1\u9648\u5217\u8fa8\u8bc6\u5ea6\uff0c\u5e76\u8ba9\u5305\u88c5\u4e0e\u54c1\u724c\u4e3b\u89c6\u89c9\u4fdd\u6301\u4e00\u81f4\u3002',
  },
  '03': {
    detail: '\u5c06\u8bbe\u8ba1\u8bed\u8a00\u62c6\u89e3\u4e3a\u53ef\u6267\u884c\u7684\u89c4\u5219\uff0c\u5305\u62ec\u6807\u5fd7\u7528\u6cd5\u3001\u8272\u5f69\u6bd4\u4f8b\u3001\u5b57\u4f53\u5c42\u7ea7\u3001\u56fe\u5f62\u8d44\u4ea7\u548c\u5e94\u7528\u793a\u4f8b\u3002',
    scope: ['\u89c6\u89c9\u89c4\u8303\u624b\u518c', '\u7ec4\u4ef6\u5316\u8bbe\u8ba1\u8d44\u4ea7', '\u5e94\u7528\u6a21\u677f', '\u9519\u8bef\u793a\u4f8b\u4e0e\u8fb9\u754c\u8bf4\u660e'],
    outcome: '\u8ba9\u56e2\u961f\u5728\u540e\u7eed\u4f20\u64ad\u548c\u8bbe\u8ba1\u6267\u884c\u4e2d\u62e5\u6709\u7edf\u4e00\u3001\u660e\u786e\u7684\u5224\u65ad\u6807\u51c6\u3002',
  },
  '04': {
    detail: '\u4ee5\u89d2\u8272\u8bbe\u5b9a\u3001\u9020\u578b\u8bed\u8a00\u548c\u8868\u60c5\u4f53\u7cfb\u6784\u5efa\u54c1\u724c\u4eba\u683c\uff0c\u8ba9\u54c1\u724c\u53d9\u4e8b\u62e5\u6709\u66f4\u5177\u8bb0\u5fc6\u70b9\u7684\u89c6\u89c9\u8f7d\u4f53\u3002',
    scope: ['\u89d2\u8272\u8bbe\u5b9a', '\u57fa\u7840\u9020\u578b\u4e0e\u6bd4\u4f8b', '\u8868\u60c5/\u52a8\u4f5c\u5ef6\u5c55', '\u573a\u666f\u5316\u5e94\u7528'],
    outcome: '\u5efa\u7acb\u53ef\u6301\u7eed\u8fd0\u8425\u7684\u54c1\u724c IP \u8d44\u4ea7\uff0c\u7528\u4e8e\u793e\u5a92\u3001\u6d3b\u52a8\u548c\u54c1\u724c\u4f20\u64ad\u3002',
  },
};

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLDivElement>(null!);
  const headingRef = useRef<HTMLDivElement>(null!);
  const listRef = useRef<HTMLDivElement>(null!);
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const particleResetTimerRef = useRef<number | null>(null);
  const dragStateRef = useRef({ currentY: 0, dragging: false, pointerId: -1, startY: 0 });
  const closingRef = useRef(false);
  const [activeProject, setActiveProject] = useState<(typeof projects)[number] | null>(null);
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

  const closeProjectSheet = useCallback(() => {
    if (closingRef.current) return;

    const modal = modalRef.current;
    const backdrop = backdropRef.current;
    if (!modal) {
      setActiveProject(null);
      return;
    }

    closingRef.current = true;
    gsap.killTweensOf([modal, backdrop]);
    gsap
      .timeline({
        defaults: { overwrite: 'auto' },
        onComplete: () => {
          dragStateRef.current = { currentY: 0, dragging: false, pointerId: -1, startY: 0 };
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
          scaleY: 0.98,
          y: () => modal.offsetHeight + 36,
          duration: 0.42,
          ease: 'power3.in',
        },
        0,
      );
  }, []);

  useEffect(() => {
    if (!activeProject || !modalRef.current) return;

    closingRef.current = false;

    document.documentElement.classList.add('project-sheet-open');
    document.body.classList.add('project-sheet-open');

    gsap.killTweensOf([modalRef.current, backdropRef.current]);
    gsap.set(backdropRef.current, { autoAlpha: 1 });
    gsap.fromTo(
      modalRef.current,
      { autoAlpha: 0, scaleY: 0.985, y: () => modalRef.current?.offsetHeight || window.innerHeight * 0.8 },
      {
        autoAlpha: 1,
        scaleY: 1,
        y: 0,
        duration: 0.5,
        ease: 'power4.out',
      },
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeProjectSheet();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.documentElement.classList.remove('project-sheet-open');
      document.body.classList.remove('project-sheet-open');
      window.removeEventListener('keydown', handleKeyDown);
      gsap.killTweensOf([modalRef.current, backdropRef.current]);
    };
  }, [activeProject, closeProjectSheet]);

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
                colors={['#c084fc', '#f472b6', '#38bdf8']}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveProject(project)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveProject(project);
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
                          background: 'rgba(92, 107, 192, 0.12)',
                          color: 'rgba(159, 168, 218, 0.85)',
                          border: '1px solid rgba(92, 107, 192, 0.2)',
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
            <button
              type="button"
              className="project-sheet-handle"
              aria-label="Close project details"
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
            <button
              type="button"
              className="project-modal-close"
              onClick={closeProjectSheet}
              aria-label="Close project details"
            >
              X
            </button>

            <div className="project-sheet-scroll" data-lenis-prevent>
              <p className="project-modal-kicker">PROJECT {activeProject.year}</p>
              <h3>{activeProject.title}</h3>
              <p className="project-modal-desc">{projectDetails[activeProject.year].detail}</p>

              <div className="project-modal-tags">
                {activeProject.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <div className="project-modal-grid">
                <div>
                  <p className="project-modal-label">Scope</p>
                  <ul>
                    {projectDetails[activeProject.year].scope.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="project-modal-label">Outcome</p>
                  <p className="project-modal-outcome">{projectDetails[activeProject.year].outcome}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
