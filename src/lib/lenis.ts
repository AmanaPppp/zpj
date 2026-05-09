type ScrollCallback = () => void;

interface LenisOptions {
  duration?: number;
  easing?: (value: number) => number;
  orientation?: 'vertical' | 'horizontal';
  gestureOrientation?: 'vertical' | 'horizontal' | 'both';
  smoothWheel?: boolean;
  wheelMultiplier?: number;
  touchMultiplier?: number;
}

export default class Lenis {
  private callbacks = new Set<ScrollCallback>();
  private lastY = typeof window === 'undefined' ? 0 : window.scrollY;
  private destroyed = false;
  private readonly handleScroll = () => {
    if (this.destroyed) return;
    this.callbacks.forEach((callback) => callback());
  };

  constructor(_options: LenisOptions = {}) {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.handleScroll, { passive: true });
    }
  }

  on(event: 'scroll', callback: ScrollCallback) {
    if (event === 'scroll') {
      this.callbacks.add(callback);
    }
  }

  raf(_time: number) {
    if (typeof window === 'undefined' || this.destroyed) return;

    const currentY = window.scrollY;
    if (currentY !== this.lastY) {
      this.lastY = currentY;
      this.handleScroll();
    }
  }

  destroy() {
    this.destroyed = true;
    this.callbacks.clear();

    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.handleScroll);
    }
  }
}
