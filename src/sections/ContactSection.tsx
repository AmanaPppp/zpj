import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from '../components/SplitText';

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
          <SplitText
            tag="p"
            text="Contact"
            className="uppercase tracking-[0.3em] mb-6"
            delay={34}
            duration={0.7}
            splitType="chars"
            threshold={0.2}
            rootMargin="-80px"
            style={{
              fontSize: '0.75rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          />

          <SplitText
            tag="h2"
            text={"\u4e00\u8d77\u521b\u9020\u6709\u8bb0\u5fc6\u70b9\u7684\u54c1\u724c\u89c6\u89c9"}
            className="text-white font-bold mb-6"
            delay={44}
            duration={0.82}
            ease="power3.out"
            splitType="chars"
            threshold={0.2}
            rootMargin="-80px"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          />

          <SplitText
            tag="p"
            text={"\u6b22\u8fce\u54c1\u724c\u89c6\u89c9\u3001\u5305\u88c5\u3001\u89c4\u8303\u624b\u518c\u4e0e IP \u5f62\u8c61\u76f8\u5173\u7684\u5408\u4f5c\u3002\u4e5f\u6b22\u8fce\u4f60\u5e26\u7740\u4e00\u4e2a\u8fd8\u6ca1\u6210\u5f62\u7684\u6982\u5ff5\u6765\u804a\uff0c\u6211\u4eec\u53ef\u4ee5\u4ece\u7b56\u7565\u548c\u89c6\u89c9\u65b9\u5411\u4e00\u8d77\u63a8\u5bfc\u3002"}
            className="mb-10 mx-auto"
            delay={28}
            duration={0.72}
            ease="power3.out"
            splitType="words"
            threshold={0.2}
            rootMargin="-80px"
            style={{
              fontSize: 'clamp(0.9rem, 1.1vw, 1.05rem)',
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1.7,
              maxWidth: '500px',
            }}
          />

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
