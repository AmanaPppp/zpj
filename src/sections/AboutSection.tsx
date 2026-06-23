import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from '../components/SplitText';
import SectionParticleEffect from '../components/SectionParticleEffect';

gsap.registerPlugin(ScrollTrigger);

type ParticleMode = 'idle' | 'active' | 'explode' | 'hidden';

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null!);
  const headingRef = useRef<HTMLDivElement>(null!);
  const cardRef = useRef<HTMLDivElement>(null!);
  const particleResetTimerRef = useRef<number | null>(null);
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
        }, 2200);
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

    return () => {
      if (particleResetTimerRef.current) {
        window.clearTimeout(particleResetTimerRef.current);
        particleResetTimerRef.current = null;
      }
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="关于我"
      ref={sectionRef}
      className="relative w-full"
      style={{ minHeight: '100vh', paddingTop: '12vh', paddingBottom: '12vh', scrollMarginTop: '96px', zIndex: 10 }}
    >
      <div
        className="grid items-center gap-12 px-6 md:grid-cols-[minmax(520px,52vw)_minmax(0,1fr)] md:gap-4 md:px-10 lg:px-12 xl:px-14"
        style={{ width: '100%', maxWidth: 'none' }}
      >
        <div style={{ maxWidth: '980px' }}>
        {/* Section label */}
        <div ref={headingRef} className="mb-10">
          <SplitText
            tag="p"
            text="About me"
            className="uppercase tracking-[0.3em] mb-4"
            delay={34}
            duration={0.7}
            splitType="chars"
            threshold={0.2}
            rootMargin="-80px"
            textAlign="left"
            style={{
              fontSize: '0.75rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          />
          <SplitText
            tag="h2"
            text={"\u5468\u7efc\u827a | \u54c1\u724c\u8bbe\u8ba1\u5e08 / \u89c6\u89c9\u521b\u610f\u63a2\u7d22\u8005"}
            className="text-white font-bold"
            delay={42}
            duration={0.82}
            ease="power3.out"
            splitType="chars"
            threshold={0.2}
            rootMargin="-80px"
            textAlign="left"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          />
        </div>

        {/* Content card */}
          <div
            ref={cardRef}
            className="rounded-2xl p-7 md:p-8"
            style={{
              background: 'rgba(5, 5, 5, 0.38)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              maxWidth: '940px',
            }}
          >
          <div className="grid gap-7 xl:grid-cols-[minmax(360px,1fr)_minmax(240px,0.58fr)]">
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

        <div className="relative hidden min-h-[760px] overflow-visible md:block">
          <SectionParticleEffect mode={particleMode} className="section-particle-effect--about" />
        </div>
      </div>
    </section>
  );
}
