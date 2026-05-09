import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const links = [
  { name: 'Portfolio', url: '#' },
  { name: 'Behance', url: 'https://behance.net' },
  { name: 'Instagram', url: 'https://instagram.com' },
  { name: 'Email', url: 'mailto:hello@amanap.design' },
];

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null!);
  const contentRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ paddingTop: '25vh', paddingBottom: '25vh', zIndex: 10 }}
    >
      <div className="mx-auto px-6 md:px-12" style={{ maxWidth: '1100px' }}>
        <div
          ref={contentRef}
          className="rounded-2xl p-10 md:p-16 text-center"
          style={{
            background: 'rgba(5, 5, 5, 0.45)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <p
            className="uppercase tracking-[0.3em] mb-6"
            style={{
              fontSize: '0.75rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            Contact
          </p>

          <h2
            className="text-white font-bold mb-6"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            一起创造{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #5c6bc0, #9fa8da)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              有记忆点的品牌视觉
            </span>
          </h2>

          <p
            className="mb-10 mx-auto"
            style={{
              fontSize: 'clamp(0.9rem, 1.1vw, 1.05rem)',
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1.7,
              maxWidth: '500px',
            }}
          >
            欢迎品牌视觉、包装、规范手册与 IP 形象相关的合作。也欢迎你带着一个还没成形的概念来聊，我们可以从策略和视觉方向一起推导。
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-6 py-3 transition-all duration-300"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.85rem',
                  background: 'rgba(92, 107, 192, 0.1)',
                  color: 'rgba(159, 168, 218, 0.9)',
                  border: '1px solid rgba(92, 107, 192, 0.25)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(92, 107, 192, 0.2)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(92, 107, 192, 0.5)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(92, 107, 192, 0.1)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(92, 107, 192, 0.25)';
                }}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p
            style={{
              fontSize: '0.75rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'rgba(255, 255, 255, 0.25)',
              letterSpacing: '0.15em',
            }}
          >
            AVAILABLE FOR BRAND DESIGN WORK — 2026
          </p>
        </div>
      </div>
    </section>
  );
}
