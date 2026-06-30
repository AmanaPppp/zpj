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
        },
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
        },
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
        className="grid items-center gap-8 px-6 md:grid-cols-[minmax(820px,70vw)_minmax(0,1fr)] md:gap-0 md:px-10 lg:px-12 xl:px-14"
        style={{ width: '100%', maxWidth: 'none' }}
      >
        <div style={{ maxWidth: '1220px' }}>
          <div ref={headingRef} className="mb-6">
            <SplitText
              tag="p"
              text="ABOUT ME"
              className="uppercase mb-2"
              delay={34}
              duration={0.7}
              splitType="chars"
              threshold={0.2}
              rootMargin="-80px"
              textAlign="left"
              style={{
                fontSize: 'clamp(2rem, 3.1vw, 3.2rem)',
                fontFamily: "'Swis721 Blk BT', 'Swis721 Blk BT Black', 'Arial Black', 'Montserrat', sans-serif",
                fontWeight: 900,
                letterSpacing: '0.02em',
                lineHeight: 1,
                color: 'rgba(255, 255, 255, 0.92)',
              }}
            />
            <SplitText
              tag="h2"
              text="周综艺 | 品牌设计师 / 视觉创意探索者"
              className="text-white font-bold"
              delay={42}
              duration={0.82}
              ease="power3.out"
              splitType="chars"
              threshold={0.2}
              rootMargin="-80px"
              textAlign="left"
              style={{
                fontSize: 'clamp(1.65rem, 2.55vw, 2.55rem)',
                fontFamily: "'Source Han Sans CN', 'Source Han Sans SC', 'Noto Sans CJK SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif",
                fontWeight: 700,
                letterSpacing: '0',
                lineHeight: 1.18,
              }}
            />
          </div>

          <div
            aria-hidden="true"
            style={{
              width: '100%',
              maxWidth: '1180px',
              height: '1px',
              marginBottom: '1.15rem',
              background: 'rgba(255, 255, 255, 0.26)',
            }}
          />

          <div ref={cardRef} className="p-0" style={{ maxWidth: '1180px' }}>
            <div className="grid gap-7">
              <div>
                <p
                  className="leading-relaxed"
                  style={{
                    fontSize: 'clamp(1.06rem, 1.42vw, 1.38rem)',
                    color: 'rgba(255, 255, 255, 0.82)',
                    fontFamily: "'Source Han Sans CN', 'Source Han Sans SC', 'Noto Sans CJK SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif",
                    fontWeight: 400,
                    lineHeight: 1.8,
                    letterSpacing: '0',
                  }}
                >
                  你好，我是周综艺。我充满好奇心，热爱品牌设计背后的策略思考。目前，我正通过一系列深度的概念提案，探索品牌视觉在不同行业中的可能性。我享受从零到一构建虚拟品牌的乐趣，也期待将这份严谨的推导逻辑和天马行空的创意带入真实的商业挑战中。
                </p>
                <p
                  className="mt-6 leading-relaxed"
                  style={{
                    fontSize: 'clamp(1.06rem, 1.42vw, 1.38rem)',
                    color: 'rgba(255, 255, 255, 0.78)',
                    fontFamily: "'Source Han Sans CN', 'Source Han Sans SC', 'Noto Sans CJK SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif",
                    fontWeight: 400,
                    lineHeight: 1.45,
                    letterSpacing: '0',
                  }}
                >
                  Hello, I'm Zhou Zongyi. Fueled by curiosity, I'm passionate about the strategic thinking behind brand design. I enjoy building virtual brands from scratch and turning strategy, visual systems, packaging, and character design into cohesive brand experiences.
                </p>
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
