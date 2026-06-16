import { createElement, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ElementType, Ref } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

type SplitTextProps = {
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: CSSProperties['textAlign'];
  style?: CSSProperties;
  onLetterAnimationComplete?: () => void;
};

type SplitElement = HTMLElement & {
  _rbsplitInstance?: GSAPSplitText | null;
};

export default function SplitText({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  style,
  onLetterAnimationComplete,
}: SplitTextProps) {
  const ref = useRef<SplitElement | null>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
      return;
    }

    let mounted = true;
    document.fonts.ready.then(() => {
      if (mounted) setFontsLoaded(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !text || !fontsLoaded || animationCompletedRef.current) return undefined;

    const ctx = gsap.context(() => {
      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch {
          // Ignore failed cleanup from a stale SplitText instance.
        }
        el._rbsplitInstance = null;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
      });

      const targets =
        splitType.includes('chars') && splitInstance.chars.length
          ? splitInstance.chars
          : splitType.includes('words') && splitInstance.words.length
            ? splitInstance.words
            : splitType.includes('lines') && splitInstance.lines.length
              ? splitInstance.lines
              : splitInstance.chars.length
                ? splitInstance.chars
                : splitInstance.words.length
                  ? splitInstance.words
                  : splitInstance.lines;

      gsap.fromTo(
        targets,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
            fastScrollEnd: true,
            anticipatePin: 0.4,
          },
          onComplete: () => {
            animationCompletedRef.current = true;
            onCompleteRef.current?.();
          },
          willChange: 'transform, opacity',
          force3D: true,
        }
      );

      el._rbsplitInstance = splitInstance;
    }, el);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === el) trigger.kill();
      });
      try {
        el._rbsplitInstance?.revert();
      } catch {
        // Ignore cleanup errors when the element is already removed.
      }
      el._rbsplitInstance = null;
      ctx.revert();
    };
  }, [
    text,
    delay,
    duration,
    ease,
    splitType,
    JSON.stringify(from),
    JSON.stringify(to),
    threshold,
    rootMargin,
    fontsLoaded,
  ]);

  const splitRef = ref as Ref<HTMLElement>;
  const SplitTag = tag as ElementType;
  const defaultDisplay = tag === 'span' ? 'inline-block' : 'block';

  return createElement(
    SplitTag,
    {
      ref: splitRef,
      className: `split-parent ${className}`.trim(),
      style: {
        textAlign,
        overflow: 'hidden',
        display: defaultDisplay,
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        willChange: 'transform, opacity',
        ...style,
      },
    },
    text
  );
}
