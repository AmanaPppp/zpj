import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null!);
  const headingRef = useRef<HTMLDivElement>(null!);
  const cardRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        cardRef.current,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          delay: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="关于我"
      ref={sectionRef}
      className="relative w-full"
      style={{ paddingTop: '20vh', paddingBottom: '20vh', scrollMarginTop: '96px', zIndex: 10 }}
    >
      <div className="mx-auto px-6 md:px-12" style={{ maxWidth: '1100px' }}>
        {/* Section label */}
        <div ref={headingRef} className="mb-12">
          <p
            className="uppercase tracking-[0.3em] mb-4"
            style={{
              fontSize: '0.75rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            About me
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
            周粽艺 |{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #5c6bc0, #9fa8da)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              品牌设计师 / 视觉创意探索者
            </span>
          </h2>
        </div>

        {/* Content card */}
        <div
          ref={cardRef}
          className="rounded-2xl p-8 md:p-12"
          style={{
            background: 'rgba(5, 5, 5, 0.45)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <p
                className="leading-relaxed"
                style={{
                  fontSize: 'clamp(0.9rem, 1.1vw, 1.05rem)',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.8,
                }}
              >
                你好，我是周粽艺。我充满好奇心，热爱品牌设计背后的策略思考。目前，我正通过一系列深度的概念提案，探索品牌视觉在不同行业中的可能性。我享受从零到一构建虚拟品牌的乐趣，也期待将这份严谨的推导逻辑和天马行空的创意带入真实的商业挑战中。
              </p>
              <p
                className="mt-5 leading-relaxed"
                style={{
                  fontSize: 'clamp(0.9rem, 1.1vw, 1.05rem)',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.8,
                }}
              >
                Hello, I'm Zhou Zongyi. Fueled by curiosity, I'm passionate about the strategic thinking behind brand design. I enjoy building virtual brands from scratch and turning strategy, visual systems, packaging, and character design into cohesive brand experiences.
              </p>
            </div>
            <div className="flex flex-col justify-center">
              <div
                className="rounded-xl p-6"
                style={{
                  background: 'rgba(92, 107, 192, 0.08)',
                  border: '1px solid rgba(92, 107, 192, 0.2)',
                }}
              >
                <p
                  className="font-semibold mb-3"
                  style={{
                    fontSize: '0.85rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'rgba(159, 168, 218, 0.9)',
                  }}
                >
                  我能做什么 (What I Do)
                </p>
                <ul className="space-y-2">
                  {[
                    '品牌视觉焕新与从零搭建',
                    '具备高落地感的包装与物料设计',
                    '系统化的品牌视觉规范制定',
                    'IP形象设计',
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3"
                      style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <span
                        className="inline-block rounded-full"
                        style={{
                          width: '6px',
                          height: '6px',
                          background: '#5c6bc0',
                        }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
