import { useCallback, useEffect, useRef, useState } from 'react';
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
import HeroNavigationOverlay, { type HeroArea } from './components/HeroNavigationOverlay';
import PageTransitionOverlay, {
  type PageTransitionOverlayHandle,
} from './components/PageTransitionOverlay';
import { schedulePosterWallImageWarmup } from './components/InfiniteFluidPosterWall';
import { preloadProjectDetailImages } from './sections/ProjectDetailGallery';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const scrollProgressRef = useRef(0);
  const sceneShellRef = useRef<HTMLDivElement>(null);
  const pageTransitionRef = useRef<PageTransitionOverlayHandle>(null);
  const mouseRef = useMouseParallax();
  const [activeHeroArea, setActiveHeroArea] = useState<HeroArea>('home');

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

  useEffect(() => {
    const isOverlayOpen = activeHeroArea !== 'home';
    document.documentElement.classList.toggle('hero-area-open', isOverlayOpen);
    document.body.classList.toggle('hero-area-open', isOverlayOpen);

    return () => {
      document.documentElement.classList.remove('hero-area-open');
      document.body.classList.remove('hero-area-open');
    };
  }, [activeHeroArea]);

  useEffect(() => {
    let warmupTimer = 0;
    let cancelPosterWarmup: (() => void) | null = null;

    const startResourceWarmup = () => {
      if (warmupTimer || cancelPosterWarmup) return;

      warmupTimer = window.setTimeout(() => {
        preloadProjectDetailImages().catch(() => undefined);
        cancelPosterWarmup = schedulePosterWallImageWarmup();
      }, 1800);
    };

    if (document.documentElement.dataset.portfolioEntered === 'true') {
      startResourceWarmup();
    } else {
      window.addEventListener('portfolio-enter', startResourceWarmup, { once: true });
    }

    return () => {
      window.removeEventListener('portfolio-enter', startResourceWarmup);
      if (warmupTimer) window.clearTimeout(warmupTimer);
      cancelPosterWarmup?.();
    };
  }, []);

  const handleHeroAreaChange = useCallback((area: HeroArea) => {
    if (area === activeHeroArea) return;

    pageTransitionRef.current?.play(() => {
      setActiveHeroArea(area);
    }) ?? setActiveHeroArea(area);
  }, [activeHeroArea]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050505]">
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
          activeHeroArea={activeHeroArea}
          onHeroAreaChange={handleHeroAreaChange}
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

      <HeroNavigationOverlay activeArea={activeHeroArea} />

      {/* Music Player - fixed bottom left */}
      <MusicPlayer />
      <IntroGate />
      <PageTransitionOverlay ref={pageTransitionRef} />
    </div>
  );
}
