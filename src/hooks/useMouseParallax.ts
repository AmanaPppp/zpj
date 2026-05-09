import { useRef, useEffect } from 'react';

interface MouseState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

export function useMouseParallax() {
  const mouseRef = useRef<MouseState>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mouseRef;
}
