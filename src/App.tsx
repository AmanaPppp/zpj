import { useEffect, useRef } from 'react';
import Lenis from './lib/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from './sections/Hero';
import AboutSection from './sections/AboutSection';
import SkillsIntroSection from './sections/SkillsIntroSection';
import SkillsSection from './sections/SkillsSection';
import ProjectsSection from './sections/ProjectsSection';
import ContactSection from './sections/ContactSection';
import Scene3D from './components/Scene3D';
import MusicPlayer from './components/MusicPlayer';
import IntroGate from './components/IntroGate';
import { useMouseParallax } from './hooks/useMouseParallax';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const scrollProgressRef = useRef(0);
  const sceneShellRef = useRef<HTMLDivElement>(null);
  const mouseRef = useMouseParallax();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);

    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="relative bg-[#050505] min-h-screen">
      {/* 3D Scene - always visible as fixed background */}
      <div
        ref={sceneShellRef}
        className="scene-shell"
        data-rgb-split-target="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        <Scene3D scrollProgress={scrollProgressRef} mouseRef={mouseRef} />
      </div>

      {/* All sections - transparent so 3D scene shows through */}
      <div data-rgb-split-target="true" style={{ position: 'relative', zIndex: 10 }}>
        <Hero
          scrollProgressRef={scrollProgressRef}
          mouseRef={mouseRef}
          sceneShellRef={sceneShellRef}
        />
        <main
          className="subpage-cosmic-bg relative overflow-hidden"
        >
          <AboutSection />
          <SkillsIntroSection />
          <SkillsSection />
          <ProjectsSection />
          <ContactSection />
        </main>
      </div>

      {/* Music Player - fixed bottom left */}
      <MusicPlayer />
      <IntroGate />
    </div>
  );
}
