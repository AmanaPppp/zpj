import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import InfiniteMenu from '../components/InfiniteMenu';

gsap.registerPlugin(ScrollTrigger);

const portfolioItems = [
  {
    image: '/avatar1.png',
    link: '#',
    title: 'Brand Identity Design',
    description: 'Logo design & brand systems',
  },
  {
    image: '/avatar2.png',
    link: '#',
    title: 'Packaging Design',
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

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="作品"
      ref={sectionRef}
      className="relative w-full"
      style={{ paddingTop: '18vh', paddingBottom: '18vh', zIndex: 10 }}
    >
      <div className="mx-auto px-6 md:px-12" style={{ maxWidth: '1200px' }}>
        <div ref={headingRef} className="mb-8 text-center">
          <p
            className="uppercase tracking-[0.3em] mb-4"
            style={{
              fontSize: '0.75rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#9fa8da',
            }}
          >
            Portfolio
          </p>
          <h2
            className="font-bold"
            style={{
              fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0',
              lineHeight: 1.2,
              color: '#ffffff',
            }}
          >
            作品展示
          </h2>
        </div>

        <div ref={menuRef}>
          <InfiniteMenu items={portfolioItems} scale={1} />
        </div>
      </div>
    </section>
  );
}
