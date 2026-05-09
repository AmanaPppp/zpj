import { useCallback, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

type TargetCursorProps = {
  scopeRef: React.RefObject<HTMLElement>;
  targetSelector?: string;
  spinDuration?: number;
  hoverDuration?: number;
  parallaxOn?: boolean;
};

export default function TargetCursor({
  scopeRef,
  targetSelector = '.cursor-target',
  spinDuration = 2,
  hoverDuration = 0.2,
  parallaxOn = true,
}: TargetCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<NodeListOf<Element> | null>(null);
  const spinTl = useRef<gsap.core.Timeline | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const targetCornerPositionsRef = useRef<Array<{ x: number; y: number }> | null>(null);
  const tickerFnRef = useRef<(() => void) | null>(null);
  const activeStrengthRef = useRef({ current: 0 });
  const insideScopeRef = useRef(false);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const userAgent = navigator.userAgent || navigator.vendor;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    return (hasTouchScreen && isSmallScreen) || mobileRegex.test(userAgent.toLowerCase());
  }, []);

  const constants = useMemo(
    () => ({
      borderWidth: 3,
      cornerSize: 12,
    }),
    []
  );

  const moveCursor = useCallback((x: number, y: number) => {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, {
      x,
      y,
      duration: 0.1,
      ease: 'power3.out',
    });
  }, []);

  useEffect(() => {
    const scope = scopeRef.current;
    const cursor = cursorRef.current;
    if (isMobile || !scope || !cursor) return;

    cornersRef.current = cursor.querySelectorAll('.target-cursor-corner');
    let activeTarget: Element | null = null;
    let currentLeaveHandler: (() => void) | null = null;
    let resumeTimeout: number | null = null;

    const setScopedCursor = (active: boolean) => {
      scope.style.cursor = active ? 'none' : '';
      gsap.to(cursor, {
        autoAlpha: active ? 1 : 0,
        duration: active ? 0.16 : 0.12,
        ease: 'power2.out',
      });
    };

    const cleanupTarget = (target: Element) => {
      if (currentLeaveHandler) {
        target.removeEventListener('mouseleave', currentLeaveHandler);
      }
      currentLeaveHandler = null;
    };

    gsap.set(cursor, {
      autoAlpha: 0,
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const createSpinTimeline = () => {
      spinTl.current?.kill();
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    };

    createSpinTimeline();

    const tickerFn = () => {
      if (!targetCornerPositionsRef.current || !cursorRef.current || !cornersRef.current) return;
      const strength = activeStrengthRef.current.current;
      if (strength === 0) return;

      const cursorX = Number(gsap.getProperty(cursorRef.current, 'x'));
      const cursorY = Number(gsap.getProperty(cursorRef.current, 'y'));
      const corners = Array.from(cornersRef.current);

      corners.forEach((corner, i) => {
        const currentX = Number(gsap.getProperty(corner, 'x'));
        const currentY = Number(gsap.getProperty(corner, 'y'));
        const targetX = targetCornerPositionsRef.current![i].x - cursorX;
        const targetY = targetCornerPositionsRef.current![i].y - cursorY;
        const finalX = currentX + (targetX - currentX) * strength;
        const finalY = currentY + (targetY - currentY) * strength;
        const duration = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;

        gsap.to(corner, {
          x: finalX,
          y: finalY,
          duration,
          ease: duration === 0 ? 'none' : 'power1.out',
          overwrite: 'auto',
        });
      });
    };

    tickerFnRef.current = tickerFn;

    const resetCorners = () => {
      if (!cornersRef.current) return;
      const corners = Array.from(cornersRef.current);
      const { cornerSize } = constants;
      const positions = [
        { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
        { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
        { x: cornerSize * 0.5, y: cornerSize * 0.5 },
        { x: -cornerSize * 1.5, y: cornerSize * 0.5 },
      ];

      gsap.killTweensOf(corners);
      corners.forEach((corner, index) => {
        gsap.to(corner, {
          x: positions[index].x,
          y: positions[index].y,
          duration: 0.3,
          ease: 'power3.out',
        });
      });
    };

    const leaveActiveTarget = () => {
      if (!activeTarget) return;
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
      }

      const target = activeTarget;
      targetCornerPositionsRef.current = null;
      gsap.set(activeStrengthRef.current, { current: 0, overwrite: true });
      activeTarget = null;
      resetCorners();

      resumeTimeout = window.setTimeout(() => {
        if (!activeTarget && cursorRef.current && spinTl.current) {
          const currentRotation = Number(gsap.getProperty(cursorRef.current, 'rotation'));
          const normalizedRotation = currentRotation % 360;
          spinTl.current.kill();
          spinTl.current = gsap
            .timeline({ repeat: -1 })
            .to(cursorRef.current, { rotation: '+=360', duration: spinDuration, ease: 'none' });
          gsap.to(cursorRef.current, {
            rotation: normalizedRotation + 360,
            duration: spinDuration * (1 - normalizedRotation / 360),
            ease: 'none',
            onComplete: () => spinTl.current?.restart(),
          });
        }
        resumeTimeout = null;
      }, 50);

      cleanupTarget(target);
    };

    const moveHandler = (e: MouseEvent) => {
      const isInsideScope = scope.contains(e.target as Node);
      if (isInsideScope !== insideScopeRef.current) {
        insideScopeRef.current = isInsideScope;
        setScopedCursor(isInsideScope);
        if (!isInsideScope) {
          leaveActiveTarget();
        }
      }

      if (!isInsideScope) return;
      moveCursor(e.clientX, e.clientY);
    };

    const mouseLeaveScopeHandler = () => {
      insideScopeRef.current = false;
      setScopedCursor(false);
      leaveActiveTarget();
    };

    const scrollHandler = () => {
      if (!activeTarget || !cursorRef.current) return;
      const mouseX = Number(gsap.getProperty(cursorRef.current, 'x'));
      const mouseY = Number(gsap.getProperty(cursorRef.current, 'y'));
      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      const isStillOverTarget =
        elementUnderMouse &&
        (elementUnderMouse === activeTarget || elementUnderMouse.closest(targetSelector) === activeTarget);
      if (!isStillOverTarget) {
        leaveActiveTarget();
      }
    };

    const mouseDownHandler = () => {
      if (!insideScopeRef.current || !dotRef.current) return;
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.3 });
      gsap.to(cursor, { scale: 0.9, duration: 0.2 });
    };

    const mouseUpHandler = () => {
      if (!insideScopeRef.current || !dotRef.current) return;
      gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
      gsap.to(cursor, { scale: 1, duration: 0.2 });
    };

    const enterHandler = (e: MouseEvent) => {
      if (!insideScopeRef.current) return;
      const directTarget = e.target as Element | null;
      const target = directTarget?.closest(targetSelector);
      if (!target || !scope.contains(target) || !cornersRef.current) return;
      if (activeTarget === target) return;
      if (activeTarget) {
        cleanupTarget(activeTarget);
      }
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }

      activeTarget = target;
      const corners = Array.from(cornersRef.current);
      corners.forEach((corner) => gsap.killTweensOf(corner));

      gsap.killTweensOf(cursor, 'rotation');
      spinTl.current?.pause();
      gsap.set(cursor, { rotation: 0 });

      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      const cursorX = Number(gsap.getProperty(cursor, 'x'));
      const cursorY = Number(gsap.getProperty(cursor, 'y'));

      targetCornerPositionsRef.current = [
        { x: rect.left - borderWidth, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize },
      ];

      if (tickerFnRef.current) {
        gsap.ticker.add(tickerFnRef.current);
      }

      gsap.to(activeStrengthRef.current, {
        current: 1,
        duration: hoverDuration,
        ease: 'power2.out',
      });

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetCornerPositionsRef.current![i].x - cursorX,
          y: targetCornerPositionsRef.current![i].y - cursorY,
          duration: 0.2,
          ease: 'power2.out',
        });
      });

      currentLeaveHandler = leaveActiveTarget;
      target.addEventListener('mouseleave', currentLeaveHandler);
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);
    scope.addEventListener('mouseleave', mouseLeaveScopeHandler);
    scope.addEventListener('mouseover', enterHandler, { passive: true });

    return () => {
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
      }
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      scope.removeEventListener('mouseleave', mouseLeaveScopeHandler);
      scope.removeEventListener('mouseover', enterHandler);

      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      spinTl.current?.kill();
      scope.style.cursor = '';
      activeStrengthRef.current.current = 0;
      targetCornerPositionsRef.current = null;
    };
  }, [scopeRef, targetSelector, spinDuration, moveCursor, constants, isMobile, hoverDuration, parallaxOn]);

  useEffect(() => {
    if (isMobile || !cursorRef.current || !spinTl.current) return;
    if (spinTl.current.isActive()) {
      spinTl.current.kill();
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(cursorRef.current, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    }
  }, [spinDuration, isMobile]);

  if (isMobile) return null;

  return (
    <div ref={cursorRef} className="target-cursor-wrapper" aria-hidden="true">
      <div ref={dotRef} className="target-cursor-dot" />
      <div className="target-cursor-corner corner-tl" />
      <div className="target-cursor-corner corner-tr" />
      <div className="target-cursor-corner corner-br" />
      <div className="target-cursor-corner corner-bl" />
    </div>
  );
}
