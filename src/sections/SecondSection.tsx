import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    title: 'Neural Architecture Search',
    description: 'Automated deep learning model design using reinforcement learning agents.',
    tags: ['PyTorch', 'RL', 'Python'],
  },
  {
    title: 'Distributed Training Framework',
    description: 'Scalable multi-GPU training pipeline with fault tolerance and auto-scaling.',
    tags: ['CUDA', 'Kubernetes', 'Go'],
  },
  {
    title: 'Real-time Inference Engine',
    description: 'Sub-millisecond model serving system with dynamic batching and GPU sharing.',
    tags: ['TensorRT', 'C++', 'gRPC'],
  },
];

const skills = [
  'Machine Learning',
  'Deep Learning',
  'Computer Vision',
  'NLP',
  'MLOps',
  'Distributed Systems',
];

export default function SecondSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current;
    const skillsEl = skillsRef.current;
    if (!section || !heading) return;

    const ctx = gsap.context(() => {
      // Heading reveal
      gsap.fromTo(
        heading,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards staggered reveal
      cards.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 80, rotateX: 15 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            ease: 'power3.out',
            delay: i * 0.15,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Skills reveal
      if (skillsEl) {
        gsap.fromTo(
          skillsEl,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: skillsEl,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{
        paddingTop: '15vh',
        paddingBottom: '15vh',
      }}
    >
      {/* Top gradient: completely transparent transition */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '20vh',
          background:
            'linear-gradient(to bottom, rgba(5,5,8,0) 0%, rgba(5,5,8,0) 100%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative">
        {/* Section Heading */}
        <div ref={headingRef} className="mb-20">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4"
            style={{ color: 'rgba(160,176,240,0.6)' }}
          >
            Selected Work
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight"
            style={{
              fontFamily: "'Geist', 'Inter', sans-serif",
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            Projects & Research
          </h2>
          <p
            className="mt-6 text-lg max-w-2xl leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            A collection of work exploring the intersection of artificial
            intelligence, system design, and human experience.
          </p>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {projects.map((project, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="group p-6 md:p-8 rounded-2xl transition-all duration-500 cursor-pointer"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(160,176,240,0.25)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <h3
                className="text-xl font-medium mb-3"
                style={{ color: 'rgba(255,255,255,0.85)' }}
              >
                {project.title}
              </h3>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(160,176,240,0.08)',
                      color: 'rgba(160,176,240,0.7)',
                      border: '1px solid rgba(160,176,240,0.15)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Skills Section */}
        <div ref={skillsRef}>
          <p
            className="text-xs tracking-[0.3em] uppercase mb-6"
            style={{ color: 'rgba(160,176,240,0.6)' }}
          >
            Expertise
          </p>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="text-sm px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105"
                style={{
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(160,176,240,0.1)';
                  e.currentTarget.style.color = 'rgba(160,176,240,0.9)';
                  e.currentTarget.style.borderColor =
                    'rgba(160,176,240,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  e.currentTarget.style.borderColor =
                    'rgba(255,255,255,0.12)';
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-32 pt-12 text-center"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Mingyue Ma — 2025
          </p>
        </div>
      </div>
    </section>
  );
}
