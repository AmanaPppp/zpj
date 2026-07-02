import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

type Poster = {
  title: string;
  code: string;
  image: string;
  accent: string;
};

const posters: Poster[] = [
  { title: 'Chrome Bloom', code: 'A01', image: '/hero/chrome-sculpture.jpg', accent: '#b7f700' },
  { title: 'Silk Signal', code: 'A02', image: '/hero/silk-flow.jpg', accent: '#ffbfd1' },
  { title: 'Prism Field', code: 'A03', image: '/hero/crystal-prism.jpg', accent: '#9ae6ff' },
  { title: 'Black Box', code: 'A04', image: '/hero/black-box.jpg', accent: '#f2ff00' },
  { title: 'Holo Orbit', code: 'A05', image: '/hero/holo-orb.jpg', accent: '#c7b8ff' },
  { title: 'Rainbow Index', code: 'A06', image: '/hero/rainbow-ring.jpg', accent: '#00ff66' },
  { title: 'Particle Palm', code: 'A07', image: '/hero/particle-hand.jpg', accent: '#ffe8a3' },
  { title: 'Iris Ring', code: 'A08', image: '/hero/iridescent-ring.jpg', accent: '#7dffea' },
  { title: 'VR Drift', code: 'A09', image: '/hero/vr-headset.jpg', accent: '#ff8cc6' },
  { title: 'Watch Face', code: 'A10', image: '/hero/smartwatch.jpg', accent: '#ddff44' },
  { title: 'Logo Study', code: 'B01', image: '/logo-gallery/logo1.png', accent: '#ffffff' },
  { title: 'Mark System', code: 'B02', image: '/logo-gallery/logo2.png', accent: '#acf6ff' },
  { title: 'Symbol Kit', code: 'B03', image: '/logo-gallery/logo3.png', accent: '#deff00' },
  { title: 'Studio Cut', code: 'B04', image: '/logo-gallery/logo4.png', accent: '#ffc8d8' },
  { title: 'Glyph Fold', code: 'B05', image: '/logo-gallery/logo5.png', accent: '#d7c7ff' },
  { title: 'Vector Heat', code: 'B06', image: '/logo-gallery/logo6.png', accent: '#00ff99' },
  { title: 'Quiet Form', code: 'B07', image: '/logo-gallery/logo7.png', accent: '#fff0a6' },
  { title: 'Identity Loop', code: 'B08', image: '/logo-gallery/logo8.png', accent: '#bffcff' },
  { title: 'Poster Logic', code: 'B09', image: '/logo-gallery/logo9.png', accent: '#ff9abc' },
  { title: 'Grid Fever', code: 'B10', image: '/logo-gallery/logo10.png', accent: '#dfff4a' },
  { title: 'Future Label', code: 'C01', image: '/hero/crystal-prism.jpg', accent: '#aafff0' },
  { title: 'Deep Matter', code: 'C02', image: '/hero/black-box.jpg', accent: '#f5ff7a' },
  { title: 'Liquid Type', code: 'C03', image: '/hero/silk-flow.jpg', accent: '#ffd1e6' },
  { title: 'Orbital Proof', code: 'C04', image: '/hero/holo-orb.jpg', accent: '#b9ff00' },
  { title: 'Refraction', code: 'C05', image: '/hero/iridescent-ring.jpg', accent: '#99e7ff' },
  { title: 'Contact Sheet', code: 'C06', image: '/logo-gallery-contact-sheet.png', accent: '#ffffff' },
  { title: 'Cover Draft', code: 'C07', image: '/logo-design-cover.png', accent: '#d8ff2f' },
  { title: 'Start Layout', code: 'C08', image: '/portfolio-start-layout.png', accent: '#ffbdd8' },
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

export default function InfiniteFluidPosterWall() {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
      onPress() {
        root.classList.add('is-dragging');
        zoomCameraOut();
      },
      onDrag: sync,
      onThrowUpdate: sync,
      onRelease: releaseDragState,
      onDragEnd: releaseDragState,
    })[0];

    const resizeObserver = new ResizeObserver(layoutCards);
    resizeObserver.observe(root);

    return () => {
      resizeObserver.disconnect();
      draggable?.kill();
      gsap.killTweensOf([grid, depth]);
    };
  }, []);

  const marqueeItems = Array.from({ length: 36 }, (_, index) => index);

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
            </article>
          ))}
        </div>
      </div>

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
