import { useEffect } from 'react';
import InfiniteFluidPosterWall from './InfiniteFluidPosterWall';
import { DottedSurface } from '@/components/ui/dotted-surface';
import ProjectDetailGallery, { preloadProjectDetailImages } from '@/sections/ProjectDetailGallery';

export type HeroArea = 'home' | 'collection' | 'personal';

type HeroNavigationOverlayProps = {
  activeArea: HeroArea;
};

export default function HeroNavigationOverlay({ activeArea }: HeroNavigationOverlayProps) {
  useEffect(() => {
    if (activeArea === 'personal') {
      preloadProjectDetailImages().catch(() => undefined);
    }
  }, [activeArea]);

  if (activeArea === 'home') return null;

  return (
    <div className="hero-area-overlay" data-lenis-prevent>
      {activeArea === 'collection' ? (
        <InfiniteFluidPosterWall />
      ) : (
        <div className="hero-personal-design-area">
          <DottedSurface className="project-detail-dotted-surface hero-personal-dotted-surface" />
          <div className="hero-personal-design-scroll project-sheet-scroll">
            <div className="project-sheet-content hero-personal-design-content">
              <ProjectDetailGallery ariaLabel="Personal design project images" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
