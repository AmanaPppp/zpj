import { useEffect } from 'react';

export function useScrollReveal(selector: string = '.animate-on-scroll') {
  useEffect(() => {
    const initObserver = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
      );

      document.querySelectorAll(selector).forEach((el) => {
        observer.observe(el);
      });
    };

    // Delay slightly to ensure DOM is ready
    const timer = setTimeout(initObserver, 100);
    return () => clearTimeout(timer);
  }, [selector]);
}
