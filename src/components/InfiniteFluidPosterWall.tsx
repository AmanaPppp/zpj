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

const posters: Poster[] = [
  { title: 'Visual 01', code: 'A01', image: '/infinite-canvas-uploaded/uploaded-01.png', accent: '#b7f700', date: '2026.01' },
  { title: 'Visual 02', code: 'A02', image: '/infinite-canvas-uploaded/uploaded-02.png', accent: '#ffbfd1', date: '2026.02' },
  { title: 'Visual 03', code: 'A03', image: '/infinite-canvas-uploaded/uploaded-03.jpg', accent: '#9ae6ff', date: '2026.03' },
  { title: 'Visual 04', code: 'A04', image: '/infinite-canvas-uploaded/uploaded-04.jpg', accent: '#f2ff00', date: '2026.04' },
  { title: 'Visual 05', code: 'A05', image: '/infinite-canvas-uploaded/uploaded-05.jpg', accent: '#c7b8ff', date: '2026.05' },
  { title: 'Visual 06', code: 'A06', image: '/infinite-canvas-uploaded/uploaded-06.png', accent: '#00ff66', date: '2026.06' },
  { title: 'Visual 07', code: 'A07', image: '/infinite-canvas-uploaded/uploaded-07.png', accent: '#ffe8a3', date: '2026.07' },
  { title: 'Visual 08', code: 'A08', image: '/infinite-canvas-uploaded/uploaded-08.png', accent: '#7dffea', date: '2026.08' },
  { title: 'Visual 09', code: 'A09', image: '/infinite-canvas-uploaded/uploaded-09.png', accent: '#ff8cc6', date: '2026.09' },
  { title: 'Visual 10', code: 'A10', image: '/infinite-canvas-uploaded/uploaded-10.png', accent: '#ddff44', date: '2026.10' },
  { title: 'Visual 11', code: 'B01', image: '/infinite-canvas-uploaded/uploaded-11.png', accent: '#ffffff', date: '2026.11' },
  { title: 'Visual 12', code: 'B02', image: '/infinite-canvas-uploaded/uploaded-12.png', accent: '#acf6ff', date: '2026.12' },
  { title: 'Visual 13', code: 'B03', image: '/infinite-canvas-uploaded/uploaded-13.png', accent: '#deff00', date: '2027.01' },
  { title: 'Visual 14', code: 'B04', image: '/infinite-canvas-uploaded/uploaded-14.png', accent: '#ffc8d8', date: '2027.02' },
  { title: 'Visual 15', code: 'B05', image: '/infinite-canvas-uploaded/uploaded-15.jpg', accent: '#d7c7ff', date: '2027.03' },
  { title: 'Visual 16', code: 'B06', image: '/infinite-canvas-uploaded/uploaded-16.jpg', accent: '#00ff99', date: '2027.04' },
  { title: 'Visual 17', code: 'B07', image: '/infinite-canvas-uploaded/uploaded-17.png', accent: '#fff0a6', date: '2027.05' },
  { title: 'Visual 18', code: 'B08', image: '/infinite-canvas-uploaded/uploaded-18.png', accent: '#bffcff', date: '2027.06' },
  { title: 'Visual 19', code: 'B09', image: '/infinite-canvas-uploaded/uploaded-19.png', accent: '#ff9abc', date: '2027.07' },
  { title: 'Visual 20', code: 'B10', image: '/infinite-canvas-uploaded/uploaded-20.png', accent: '#dfff4a', date: '2027.08' },
  { title: 'Visual 21', code: 'C01', image: '/infinite-canvas-uploaded/uploaded-21.png', accent: '#aafff0', date: '2027.09' },
  { title: 'Visual 22', code: 'C02', image: '/infinite-canvas-uploaded/uploaded-22.png', accent: '#f5ff7a', date: '2027.10' },
  { title: 'Visual 23', code: 'C03', image: '/infinite-canvas-uploaded/uploaded-23.png', accent: '#ffd1e6', date: '2027.11' },
  { title: 'Visual 24', code: 'C04', image: '/infinite-canvas-uploaded/uploaded-24.png', accent: '#b9ff00', date: '2027.12' },
  { title: 'Visual 25', code: 'C05', image: '/infinite-canvas-uploaded/uploaded-25.png', accent: '#99e7ff', date: '2028.01' },
  { title: 'Visual 26', code: 'C06', image: '/infinite-canvas-uploaded/uploaded-26.png', accent: '#ffffff', date: '2028.02' },
  { title: 'Visual 27', code: 'C07', image: '/infinite-canvas-uploaded/uploaded-27.png', accent: '#d8ff2f', date: '2028.03' },
  { title: 'Visual 28', code: 'C08', image: '/infinite-canvas-uploaded/uploaded-28.png', accent: '#ffbdd8', date: '2028.04' },
  { title: 'Visual 29', code: 'D01', image: '/infinite-canvas-uploaded/uploaded-29.png', accent: '#b7f700', date: '2028.05' },
  { title: 'Visual 30', code: 'D02', image: '/infinite-canvas-uploaded/uploaded-30.png', accent: '#ffbfd1', date: '2028.06' },
  { title: 'Visual 31', code: 'D03', image: '/infinite-canvas-uploaded/uploaded-31.png', accent: '#9ae6ff', date: '2028.07' },
  { title: 'Visual 32', code: 'D04', image: '/infinite-canvas-uploaded/uploaded-32.png', accent: '#f2ff00', date: '2028.08' },
  { title: 'Visual 33', code: 'D05', image: '/infinite-canvas-uploaded/uploaded-33.jpg', accent: '#c7b8ff', date: '2028.09' },
  { title: 'Visual 34', code: 'D06', image: '/infinite-canvas-uploaded/uploaded-34.jpg', accent: '#00ff66', date: '2028.10' },
  { title: 'Visual 35', code: 'D07', image: '/infinite-canvas-uploaded/uploaded-35.jpg', accent: '#ffe8a3', date: '2028.11' },
];

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
              <img src={poster.image} alt="" draggable={false} />
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
