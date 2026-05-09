import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    title: '品牌视觉焕新',
    desc: '围绕品牌定位、标志系统、色彩语言和版式规范建立完整视觉识别，让概念品牌拥有可延展的商业表达。',
    tags: ['Brand Strategy', 'Logo System', 'Visual Identity'],
    year: '01',
  },
  {
    title: '包装与物料设计',
    desc: '从产品包装到线下触点，建立具有落地感的视觉物料系统，让品牌在真实消费场景里保持统一识别。',
    tags: ['Packaging', 'Collateral', 'Production'],
    year: '02',
  },
  {
    title: '视觉规范手册',
    desc: '将设计语言拆解为可执行的规则，包括标志用法、色彩比例、字体层级、图形资产和应用示例。',
    tags: ['Guidelines', 'Design System', 'Manual'],
    year: '03',
  },
  {
    title: 'IP 形象设计',
    desc: '以角色设定、造型语言和表情体系构建品牌人格，让品牌叙事拥有更具记忆点的视觉载体。',
    tags: ['Character', 'Mascot', 'Storytelling'],
    year: '04',
  },
];

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLDivElement>(null!);
  const headingRef = useRef<HTMLDivElement>(null!);
  const listRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const ctx = gsap.context(() => {
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
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ paddingTop: '20vh', paddingBottom: '20vh', zIndex: 10 }}
    >
      <div className="mx-auto px-6 md:px-12" style={{ maxWidth: '1100px' }}>
        {/* Section label */}
        <div ref={headingRef} className="mb-16">
          <p
            className="uppercase tracking-[0.3em] mb-4"
            style={{
              fontSize: '0.75rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            Projects
          </p>
          <h2
            className="text-white font-bold"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            系统化的{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #5c6bc0, #9fa8da)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              品牌项目
            </span>
          </h2>
        </div>

        {/* Project list */}
        <div ref={listRef} className="space-y-4">
          {projects.map((project, i) => (
            <div
              key={i}
              className="group rounded-xl p-6 md:p-8 transition-all duration-300"
              style={{
                background: 'rgba(5, 5, 5, 0.4)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(5, 5, 5, 0.6)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(92, 107, 192, 0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(5, 5, 5, 0.4)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
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
                    }}
                  >
                    {project.desc}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {project.tags.map((tag, j) => (
                    <span
                      key={j}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
