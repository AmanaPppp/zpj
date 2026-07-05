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
  { title: 'Chrome Bloom', code: 'A01', image: '/hero/chrome-sculpture.jpg', accent: '#b7f700', date: '2024.01' },
  { title: 'Silk Signal', code: 'A02', image: '/hero/silk-flow.jpg', accent: '#ffbfd1', date: '2024.02' },
  { title: 'Prism Field', code: 'A03', image: '/hero/crystal-prism.jpg', accent: '#9ae6ff', date: '2024.03' },
  { title: 'Black Box', code: 'A04', image: '/hero/black-box.jpg', accent: '#f2ff00', date: '2024.04' },
  { title: 'Holo Orbit', code: 'A05', image: '/hero/holo-orb.jpg', accent: '#c7b8ff', date: '2024.05' },
  { title: 'Rainbow Index', code: 'A06', image: '/hero/rainbow-ring.jpg', accent: '#00ff66', date: '2024.06' },
  { title: 'Particle Palm', code: 'A07', image: '/hero/particle-hand.jpg', accent: '#ffe8a3', date: '2024.07' },
  { title: 'Iris Ring', code: 'A08', image: '/hero/iridescent-ring.jpg', accent: '#7dffea', date: '2024.08' },
  { title: 'VR Drift', code: 'A09', image: '/hero/vr-headset.jpg', accent: '#ff8cc6', date: '2024.09' },
  { title: 'Watch Face', code: 'A10', image: '/hero/smartwatch.jpg', accent: '#ddff44', date: '2024.10' },
  { title: 'Logo Study', code: 'B01', image: '/logo-gallery/logo1.png', accent: '#ffffff', date: '2024.11' },
  { title: 'Mark System', code: 'B02', image: '/logo-gallery/logo2.png', accent: '#acf6ff', date: '2024.12' },
  { title: 'Symbol Kit', code: 'B03', image: '/logo-gallery/logo3.png', accent: '#deff00', date: '2025.01' },
  { title: 'Studio Cut', code: 'B04', image: '/logo-gallery/logo4.png', accent: '#ffc8d8', date: '2025.02' },
  { title: 'Glyph Fold', code: 'B05', image: '/logo-gallery/logo5.png', accent: '#d7c7ff', date: '2025.03' },
  { title: 'Vector Heat', code: 'B06', image: '/logo-gallery/logo6.png', accent: '#00ff99', date: '2025.04' },
  { title: 'Quiet Form', code: 'B07', image: '/logo-gallery/logo7.png', accent: '#fff0a6', date: '2025.05' },
  { title: 'Identity Loop', code: 'B08', image: '/logo-gallery/logo8.png', accent: '#bffcff', date: '2025.06' },
  { title: 'Poster Logic', code: 'B09', image: '/logo-gallery/logo9.png', accent: '#ff9abc', date: '2025.07' },
  { title: 'Grid Fever', code: 'B10', image: '/logo-gallery/logo10.png', accent: '#dfff4a', date: '2025.08' },
  { title: 'Future Label', code: 'C01', image: '/hero/crystal-prism.jpg', accent: '#aafff0', date: '2025.09' },
  { title: 'Deep Matter', code: 'C02', image: '/hero/black-box.jpg', accent: '#f5ff7a', date: '2025.10' },
  { title: 'Liquid Type', code: 'C03', image: '/hero/silk-flow.jpg', accent: '#ffd1e6', date: '2025.11' },
  { title: 'Orbital Proof', code: 'C04', image: '/hero/holo-orb.jpg', accent: '#b9ff00', date: '2025.12' },
  { title: 'Refraction', code: 'C05', image: '/hero/iridescent-ring.jpg', accent: '#99e7ff', date: '2026.01' },
  { title: 'Contact Sheet', code: 'C06', image: '/logo-gallery-contact-sheet.png', accent: '#ffffff', date: '2026.02' },
  { title: 'Cover Draft', code: 'C07', image: '/logo-design-cover.png', accent: '#d8ff2f', date: '2026.03' },
  { title: 'Start Layout', code: 'C08', image: '/portfolio-start-layout.png', accent: '#ffbdd8', date: '2026.04' },
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
        <img className="poster-wall-brand-static" src="/personal-logo-static.png" alt="" draggable={false} />
        <video
          ref={logoVideoRef}
          className="poster-wall-brand-video"
          src="/personal-logo-hover.webm"
          poster="/personal-logo-static.png"
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
