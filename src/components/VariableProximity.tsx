import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties, RefObject } from 'react';

type Falloff = 'linear' | 'exponential' | 'gaussian';

interface VariableProximityProps {
  label: string;
  containerRef: RefObject<HTMLElement | null>;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  radius?: number;
  falloff?: Falloff;
  className?: string;
  letterClassName?: string;
  getLetterStyle?: (index: number, letter: string) => CSSProperties;
}

interface ParsedAxis {
  axis: string;
  fromValue: number;
  toValue: number;
}

const parseFontVariationSettings = (settings: string) => {
  return new Map(
    settings
      .split(',')
      .map((setting) => setting.trim())
      .filter(Boolean)
      .map((setting) => {
        const [name, value] = setting.split(/\s+/);
        return [name.replace(/['"]/g, ''), Number.parseFloat(value)];
      }),
  );
};

export default function VariableProximity({
  label,
  containerRef,
  fromFontVariationSettings,
  toFontVariationSettings,
  radius = 90,
  falloff = 'linear',
  className = '',
  letterClassName = '',
  getLetterStyle,
}: VariableProximityProps) {
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const mousePositionRef = useRef({ x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY });
  const lastPositionRef = useRef({ x: Number.NaN, y: Number.NaN });

  const parsedSettings = useMemo<ParsedAxis[]>(() => {
    const fromSettings = parseFontVariationSettings(fromFontVariationSettings);
    const toSettings = parseFontVariationSettings(toFontVariationSettings);

    return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: toSettings.get(axis) ?? fromValue,
    }));
  }, [fromFontVariationSettings, toFontVariationSettings]);

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      mousePositionRef.current = {
        x: x - rect.left,
        y: y - rect.top,
      };
    };

    const handleMouseMove = (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) updatePosition(touch.clientX, touch.clientY);
    };

    const handleLeave = () => {
      mousePositionRef.current = {
        x: Number.POSITIVE_INFINITY,
        y: Number.POSITIVE_INFINITY,
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, [containerRef]);

  useEffect(() => {
    let frameId = 0;

    const calculateFalloff = (distance: number) => {
      const normalized = Math.min(Math.max(1 - distance / radius, 0), 1);
      if (falloff === 'exponential') return normalized ** 2;
      if (falloff === 'gaussian') return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
      return normalized;
    };

    const tick = () => {
      const container = containerRef.current;
      const { x, y } = mousePositionRef.current;

      if (container && (lastPositionRef.current.x !== x || lastPositionRef.current.y !== y)) {
        const containerRect = container.getBoundingClientRect();
        lastPositionRef.current = { x, y };

        letterRefs.current.forEach((letter) => {
          if (!letter) return;

          const rect = letter.getBoundingClientRect();
          const letterX = rect.left + rect.width / 2 - containerRect.left;
          const letterY = rect.top + rect.height / 2 - containerRect.top;
          const distance = Math.hypot(x - letterX, y - letterY);
          const strength = distance >= radius ? 0 : calculateFalloff(distance);

          const settings = parsedSettings
            .map(({ axis, fromValue, toValue }) => {
              const value = fromValue + (toValue - fromValue) * strength;
              return `'${axis}' ${value.toFixed(2)}`;
            })
            .join(', ');

          letter.style.fontVariationSettings = settings;
          letter.style.setProperty('--proximity-strength', strength.toFixed(3));
        });
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [containerRef, falloff, fromFontVariationSettings, parsedSettings, radius]);

  let letterIndex = 0;

  return (
    <span className={`variable-proximity ${className}`.trim()} aria-label={label}>
      {label.split(' ').map((word, wordIndex, words) => (
        <span className="variable-proximity-word" key={`${word}-${wordIndex}`}>
          {word.split('').map((letter) => {
            const currentIndex = letterIndex;
            letterIndex += 1;

            return (
              <span
                aria-hidden="true"
                className={`variable-proximity-letter ${letterClassName}`.trim()}
                key={`${letter}-${currentIndex}`}
                ref={(node) => {
                  letterRefs.current[currentIndex] = node;
                }}
                style={{
                  fontVariationSettings: fromFontVariationSettings,
                  ...getLetterStyle?.(currentIndex, letter),
                }}
              >
                {letter}
              </span>
            );
          })}
          {wordIndex < words.length - 1 && (
            <span aria-hidden="true" className="variable-proximity-space">
              &nbsp;
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
