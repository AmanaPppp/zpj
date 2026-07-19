import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

type Poster = {
  title: string;
  code: string;
  image: string;
  accent: string;
  date: string;
};

const OPTIMIZED_POSTER_ROOT = '/infinite-canvas-optimized';

function createPoster(
  title: string,
  code: string,
  sourceFile: string,
  accent: string,
  date: string,
  preserveExtension = false,
): Poster {
  return {
    title,
    code,
    image: `${OPTIMIZED_POSTER_ROOT}/${preserveExtension ? sourceFile : sourceFile.replace(/\.(?:png|jpe?g)$/i, '.webp')}`,
    accent,
    date,
  };
}

const posters: Poster[] = [
  createPoster('Visual 01', 'A01', 'uploaded-01.png', '#b7f700', '2026.01'),
  createPoster('Visual 02', 'A02', 'uploaded-02.png', '#ffbfd1', '2026.02'),
  createPoster('Visual 03', 'A03', 'uploaded-03.jpg', '#9ae6ff', '2026.03'),
  createPoster('Visual 04', 'A04', 'uploaded-04.jpg', '#f2ff00', '2026.04'),
  createPoster('Visual 05', 'A05', 'uploaded-05.jpg', '#c7b8ff', '2026.05'),
  createPoster('Visual 06', 'A06', 'uploaded-06.png', '#00ff66', '2026.06'),
  createPoster('Visual 07', 'A07', 'uploaded-07.png', '#ffe8a3', '2026.07'),
  createPoster('Visual 08', 'A08', 'uploaded-08.png', '#7dffea', '2026.08'),
  createPoster('Visual 09', 'A09', 'uploaded-09.png', '#ff8cc6', '2026.09'),
  createPoster('Visual 10', 'A10', 'uploaded-10.png', '#ddff44', '2026.10'),
  createPoster('Visual 11', 'B01', 'uploaded-11.png', '#ffffff', '2026.11'),
  createPoster('Visual 12', 'B02', 'uploaded-12.png', '#acf6ff', '2026.12'),
  createPoster('Visual 13', 'B03', 'uploaded-13.png', '#deff00', '2027.01'),
  createPoster('Visual 14', 'B04', 'uploaded-14.png', '#ffc8d8', '2027.02'),
  createPoster('Visual 15', 'B05', 'uploaded-15.jpg', '#d7c7ff', '2027.03'),
  createPoster('Visual 16', 'B06', 'uploaded-16.jpg', '#00ff99', '2027.04'),
  createPoster('Visual 17', 'B07', 'uploaded-17.png', '#fff0a6', '2027.05'),
  createPoster('Visual 18', 'B08', 'uploaded-18.png', '#bffcff', '2027.06'),
  createPoster('Visual 19', 'B09', 'uploaded-19.png', '#ff9abc', '2027.07'),
  createPoster('Visual 20', 'B10', 'uploaded-20.png', '#dfff4a', '2027.08'),
  createPoster('Visual 21', 'C01', 'uploaded-21.png', '#aafff0', '2027.09'),
  createPoster('Visual 22', 'C02', 'uploaded-22.png', '#f5ff7a', '2027.10'),
  createPoster('Visual 23', 'C03', 'uploaded-23.png', '#ffd1e6', '2027.11'),
  createPoster('Visual 24', 'C04', 'uploaded-24.png', '#b9ff00', '2027.12'),
  createPoster('Visual 25', 'C05', 'uploaded-25.png', '#99e7ff', '2028.01'),
  createPoster('Visual 26', 'C06', 'uploaded-26.png', '#ffffff', '2028.02'),
  createPoster('Visual 27', 'C07', 'uploaded-27.png', '#d8ff2f', '2028.03'),
  createPoster('Visual 28', 'C08', 'uploaded-28.png', '#ffbdd8', '2028.04'),
  createPoster('Visual 29', 'D01', 'uploaded-29.png', '#b7f700', '2028.05'),
  createPoster('Visual 30', 'D02', 'uploaded-30.png', '#ffbfd1', '2028.06'),
  createPoster('Visual 31', 'D03', 'uploaded-31.png', '#9ae6ff', '2028.07'),
  createPoster('Visual 32', 'D04', 'uploaded-32.png', '#f2ff00', '2028.08'),
  createPoster('Visual 33', 'D05', 'uploaded-33.jpg', '#c7b8ff', '2028.09'),
  createPoster('Visual 34', 'D06', 'uploaded-34.jpg', '#00ff66', '2028.10'),
  createPoster('Visual 35', 'D07', 'uploaded-35.jpg', '#ffe8a3', '2028.11'),
  createPoster('Raven Peak', 'D08', 'raven-peak.jpg', '#ffffff', '2028.12', true),
  createPoster('Visual 36', 'D09', 'uploaded-36.png', '#ffbfd1', '2029.01'),
  createPoster('Visual 37', 'D10', 'uploaded-37.png', '#9ae6ff', '2029.02'),
  createPoster('Visual 38', 'D11', 'uploaded-38.jpg', '#99e7ff', '2029.03'),
  createPoster('Visual 39', 'D12', 'uploaded-39.png', '#f2ff00', '2029.04'),
  createPoster('Visual 40', 'D13', 'uploaded-40.png', '#ffbfd1', '2029.05'),
  createPoster('Visual 41', 'D14', 'uploaded-41.png', '#c7b8ff', '2029.06'),
  createPoster('Visual 42', 'D15', 'uploaded-42.png', '#00ff66', '2029.07'),
  createPoster('Visual 43', 'D16', 'uploaded-43.png', '#ffffff', '2029.08'),
];

const posterWallImageUrls = posters.map((poster) => poster.image);
const posterWallPreloadCache = new Map<string, Promise<void>>();

function preloadPosterWallImage(src: string): Promise<void> {
  const existing = posterWallPreloadCache.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    const image = new Image();
    image.decoding = 'async';
    image.loading = 'eager';
    image.onload = () => image.decode().then(resolve, resolve);
    image.onerror = () => resolve();
    image.src = src;

    if (image.complete) {
      image.decode().then(resolve, resolve);
    }
  });

  posterWallPreloadCache.set(src, promise);
  return promise;
}

export function preloadPosterWallImages(): Promise<unknown> {
  return Promise.all(posterWallImageUrls.map(preloadPosterWallImage));
}

const posterTiles = Array.from({ length: 160 }, (_, index) => ({
  ...posters[index % posters.length],
  tileId: index,
}));

const columnOffsets = [-130, 120, -36, 172, -92];
const safeColumns = 2;
const safeRows = 2;
const cameraScaleIn = 1.78;
const cameraScaleOut = 1.22;

function wrapCoordinate(value: number, min: number, max: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

function roundUpToMultiple(value: number, multiple: number) {
  return Math.ceil(value / multiple) * multiple;
}

type InfiniteFluidPosterWallProps = {
  onReturn?: () => void;
};

export default function InfiniteFluidPosterWall({ onReturn }: InfiniteFluidPosterWallProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const logoVideoRef = useRef<HTMLVideoElement>(null);
  const logoResetTimerRef = useRef<number | null>(null);
  const restoreExpandedCardRef = useRef<(() => void) | null>(null);
  const [hasExpandedCard, setHasExpandedCard] = useState(false);

  useEffect(() => {
    preloadPosterWallImages().catch(() => undefined);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const grid = gridRef.current;
    if (!root || !grid) return;

    const depth = root.querySelector<HTMLElement>('.poster-wall-depth');
    if (!depth) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>('.fluid-poster-card'));
    const layouts: Array<{ baseX: number; baseY: number }> = [];
    let stepX = 1;
    let stepY = 1;
    let worldWidth = 1;
    let worldHeight = 1;
    let wrapMinX = -1;
    let wrapMinY = -1;
    let draggable: Draggable | undefined;
    let isCameraPulledBack = false;
    let pressedCard: HTMLElement | null = null;
    let pressX = 0;
    let pressY = 0;
    let expandedSourceCard: HTMLElement | null = null;
    let expandedClone: HTMLElement | null = null;
    let expandedFloatTween: gsap.core.Tween | null = null;
    let expandedReturnTween: gsap.core.Tween | null = null;

    const restoreExpandedCard = () => {
      if (!expandedClone || !expandedSourceCard || expandedReturnTween) return;

      const clone = expandedClone;
      const source = expandedSourceCard;
      const rootRect = root.getBoundingClientRect();
      const sourceRect = source.getBoundingClientRect();

      expandedFloatTween?.kill();
      expandedFloatTween = null;
      expandedReturnTween = gsap.to(clone, {
        left: sourceRect.left - rootRect.left,
        top: sourceRect.top - rootRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
        y: 0,
        rotate: 0,
        duration: 0.54,
        ease: 'power3.inOut',
        overwrite: true,
        onComplete: () => {
          source.classList.remove('is-card-source-hidden');
          clone.remove();
          expandedClone = null;
          expandedSourceCard = null;
          expandedReturnTween = null;
          root.classList.remove('has-expanded-card');
          root.style.removeProperty('--poster-card-return-left');
          root.style.removeProperty('--poster-card-return-top');
          draggable?.enable();
          setHasExpandedCard(false);
        },
      });
    };

    restoreExpandedCardRef.current = restoreExpandedCard;

    const expandCard = (card: HTMLElement) => {
      if (expandedClone || expandedReturnTween) return;

      gsap.killTweensOf(grid);
      draggable?.disable();
      root.classList.remove('is-dragging');
      root.classList.add('has-expanded-card');
      zoomCameraIn();

      const rootRect = root.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const clone = card.cloneNode(true) as HTMLElement;
      const image = card.querySelector<HTMLImageElement>('img');
      const imageAspectRatio = image?.naturalWidth && image.naturalHeight ? image.naturalHeight / image.naturalWidth : cardRect.height / cardRect.width;
      let targetWidth = Math.min(rootRect.width * 0.68, 620);
      targetWidth = Math.max(Math.min(targetWidth, rootRect.width - 72), 260);
      let targetHeight = targetWidth * imageAspectRatio;
      if (targetHeight > rootRect.height * 0.7) {
        targetHeight = rootRect.height * 0.7;
        targetWidth = targetHeight / imageAspectRatio;
      }
      const targetLeft = (rootRect.width - targetWidth) / 2;
      const targetTop = (rootRect.height - targetHeight) / 2;
      root.style.setProperty('--poster-card-return-left', `${targetLeft + 18}px`);
      root.style.setProperty('--poster-card-return-top', `${targetTop + 18}px`);

      clone.classList.add('poster-card-expanded-clone');
      clone.classList.remove('is-card-source-hidden');
      clone.setAttribute('aria-hidden', 'true');
      Object.assign(clone.style, {
        display: 'block',
        left: `${cardRect.left - rootRect.left}px`,
        top: `${cardRect.top - rootRect.top}px`,
        width: `${cardRect.width}px`,
        height: `${cardRect.height}px`,
        transform: 'translate3d(0, 0, 0)',
      });

      root.appendChild(clone);
      card.classList.add('is-card-source-hidden');
      expandedSourceCard = card;
      expandedClone = clone;
      setHasExpandedCard(true);

      gsap.to(clone, {
        left: targetLeft,
        top: targetTop,
        width: targetWidth,
        height: targetHeight,
        duration: 0.72,
        ease: 'expo.out',
        force3D: true,
        overwrite: true,
        onComplete: () => {
          expandedFloatTween = gsap.to(clone, {
            y: -18,
            rotate: 0.7,
            duration: 1.8,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            force3D: true,
          });
        },
      });
    };

    const layoutCards = () => {
      const rect = root.getBoundingClientRect();
      const viewportWidth = Math.max(rect.width, 1);
      const viewportHeight = Math.max(rect.height, 1);
      const isCompact = viewportWidth < 760;
      const slotWidth = Math.max(isCompact ? 132 : 190, Math.min(viewportWidth * (isCompact ? 0.31 : 0.145), isCompact ? 188 : 268));
      const slotHeight = slotWidth * 1.42;
      const gapX = Math.max(isCompact ? 86 : 120, Math.min(viewportWidth * 0.09, isCompact ? 132 : 188));
      const gapY = Math.max(isCompact ? 112 : 150, Math.min(viewportHeight * 0.2, isCompact ? 170 : 240));
      stepX = slotWidth + gapX;
      stepY = slotHeight + gapY;
      const neededColumns = Math.max(6, Math.ceil(viewportWidth / stepX) + safeColumns * 2 + 1);
      const columns = roundUpToMultiple(neededColumns, columnOffsets.length);
      const rows = Math.max(1, Math.floor(cards.length / columns));
      const filledCardCount = rows * columns;
      worldWidth = columns * stepX;
      worldHeight = rows * stepY;
      wrapMinX = -safeColumns * stepX;
      wrapMinY = -safeRows * stepY - Math.max(...columnOffsets.map((offset) => Math.abs(offset)));
      const startX = wrapMinX + (stepX - slotWidth) / 2;
      const startY = -safeRows * stepY;

      cards.forEach((card, index) => {
        if (index >= filledCardCount) {
          card.style.display = 'none';
          return;
        }

        card.style.display = '';
        const column = index % columns;
        const row = Math.floor(index / columns);
        const columnOffset = columnOffsets[column % columnOffsets.length];
        layouts[index] = {
          baseX: startX + column * stepX,
          baseY: startY + row * stepY + columnOffset,
        };
        card.style.width = `${slotWidth}px`;
        card.style.height = `${slotHeight}px`;
      });

      renderCards(Number(gsap.getProperty(grid, 'x')) || 0, Number(gsap.getProperty(grid, 'y')) || 0);
    };

    const renderCards = (offsetX: number, offsetY: number) => {
      cards.forEach((card, index) => {
        const layout = layouts[index];
        if (!layout) return;
        const wrappedX = wrapCoordinate(layout.baseX + offsetX, wrapMinX, wrapMinX + worldWidth);
        const wrappedY = wrapCoordinate(layout.baseY + offsetY, wrapMinY, wrapMinY + worldHeight);
        card.style.transform = `translate3d(${wrappedX - offsetX}px, ${wrappedY - offsetY}px, 0)`;
      });
    };

    const sync = () => {
      renderCards(Number(gsap.getProperty(grid, 'x')) || 0, Number(gsap.getProperty(grid, 'y')) || 0);
    };

    const zoomCameraOut = () => {
      if (isCameraPulledBack) return;
      isCameraPulledBack = true;
      gsap.to(depth, {
        scale: cameraScaleOut,
        duration: 0.62,
        ease: 'power3.out',
        force3D: true,
        overwrite: 'auto',
      });
    };

    const releaseDragState = () => {
      root.classList.remove('is-dragging');
      zoomCameraIn();
    };

    const zoomCameraIn = () => {
      if (!isCameraPulledBack) return;
      isCameraPulledBack = false;
      gsap.to(depth, {
        scale: cameraScaleIn,
        duration: 1.45,
        ease: 'expo.out',
        force3D: true,
        overwrite: 'auto',
      });
    };

    gsap.set(grid, { x: 0, y: 0, force3D: true });
    gsap.set(depth, { scale: cameraScaleIn, force3D: true });
    layoutCards();

    draggable = Draggable.create(grid, {
      type: 'x,y',
      inertia: true,
      trigger: root,
      cursor: 'grab',
      activeCursor: 'grabbing',
      allowNativeTouchScrolling: false,
      minimumMovement: 1,
      onPress(this: Draggable) {
        const target = this.pointerEvent.target;
        if (target instanceof Element && target.closest('.poster-wall-brand')) {
          this.endDrag(this.pointerEvent);
          return;
        }

        root.classList.add('is-dragging');
        zoomCameraOut();
      },
      onDrag: sync,
      onThrowUpdate: sync,
      onRelease: releaseDragState,
      onDragEnd: releaseDragState,
    })[0];

    const handlePointerDown = (event: PointerEvent) => {
      if (expandedClone) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const card = target.closest<HTMLElement>('.fluid-poster-card');
      if (!card || !root.contains(card) || card.classList.contains('poster-card-expanded-clone')) return;

      pressedCard = card;
      pressX = event.clientX;
      pressY = event.clientY;
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!pressedCard || expandedClone) {
        pressedCard = null;
        return;
      }

      const moved = Math.hypot(event.clientX - pressX, event.clientY - pressY);
      const card = pressedCard;
      pressedCard = null;

      if (moved <= 8) {
        expandCard(card);
      }
    };

    root.addEventListener('pointerdown', handlePointerDown, true);
    root.addEventListener('pointerup', handlePointerUp, true);

    const resizeObserver = new ResizeObserver(layoutCards);
    resizeObserver.observe(root);

    return () => {
      resizeObserver.disconnect();
      root.removeEventListener('pointerdown', handlePointerDown, true);
      root.removeEventListener('pointerup', handlePointerUp, true);
      draggable?.kill();
      expandedFloatTween?.kill();
      expandedReturnTween?.kill();
      expandedClone?.remove();
      expandedSourceCard?.classList.remove('is-card-source-hidden');
      restoreExpandedCardRef.current = null;
      gsap.killTweensOf([grid, depth, expandedClone].filter(Boolean));
      if (logoResetTimerRef.current !== null) {
        window.clearTimeout(logoResetTimerRef.current);
      }
    };
  }, []);

  const marqueeItems = Array.from({ length: 36 }, (_, index) => index);
  const playLogoAnimation = () => {
    const video = logoVideoRef.current;
    if (!video || (!video.paused && !video.ended)) return;

    const brand = video.parentElement;
    if (logoResetTimerRef.current !== null) {
      window.clearTimeout(logoResetTimerRef.current);
      logoResetTimerRef.current = null;
    }

    video.currentTime = 0;
    brand?.classList.add('is-playing');
    video.play().catch(() => {
      brand?.classList.remove('is-playing');
    });
  };

  const resetLogoAnimation = () => {
    const video = logoVideoRef.current;
    if (!video) return;

    video.parentElement?.classList.remove('is-playing');
    logoResetTimerRef.current = window.setTimeout(() => {
      video.pause();
      video.currentTime = 0;
      logoResetTimerRef.current = null;
    }, 180);
  };

  const handleExpandedCardReturn = () => {
    restoreExpandedCardRef.current?.();
  };

  return (
    <div ref={rootRef} className="infinite-fluid-poster-wall" data-lenis-prevent>
      <div className="poster-wall-depth">
        <div ref={gridRef} className="poster-wall-grid" aria-label="Infinite fluid draggable poster wall">
          {posterTiles.map((poster) => (
            <article
              key={`${poster.code}-${poster.tileId}`}
              className="fluid-poster-card"
              style={{ '--poster-accent': poster.accent } as React.CSSProperties}
            >
              <img
                src={poster.image}
                alt=""
                draggable={false}
                loading="eager"
                decoding="async"
              />
              <div className="fluid-poster-shade" />
              <div className="fluid-poster-copy">
                <span>{poster.code}</span>
                <strong>{poster.title}</strong>
              </div>
              <div className="poster-card-expanded-meta" aria-hidden="true">
                <span>{poster.date}</span>
                <strong>{poster.title}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div
        className="poster-wall-brand"
        role={onReturn ? 'button' : undefined}
        tabIndex={onReturn ? 0 : undefined}
        aria-label={onReturn ? 'Return from poster wall' : 'Personal logo animation'}
        onPointerEnter={playLogoAnimation}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onReturn}
        onKeyDown={(event) => {
          if (!onReturn || (event.key !== 'Enter' && event.key !== ' ')) return;
          event.preventDefault();
          onReturn();
        }}
      >
        <video
          ref={logoVideoRef}
          className="poster-wall-brand-video"
          src="/personal-logo-hover.webm"
          poster="/personal-logo-hover-poster.png"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onEnded={resetLogoAnimation}
        />
      </div>

      {hasExpandedCard && (
        <button type="button" className="poster-card-return" onClick={handleExpandedCardReturn}>
          RETURN
        </button>
      )}

      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <div key={side} className={`drag-marquee-border drag-marquee-border--${side}`} aria-hidden="true">
          <div>
            {marqueeItems.map((item) => (
              <img key={`${side}-a-${item}`} src="/personal-logo.png" alt="" draggable={false} />
            ))}
            {marqueeItems.map((item) => (
              <img key={`${side}-b-${item}`} src="/personal-logo.png" alt="" draggable={false} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
