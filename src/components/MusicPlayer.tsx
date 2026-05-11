import { useCallback, useEffect, useRef, useState } from 'react';

interface Track {
  title: string;
  artist: string;
  src: string;
}

const builtInTracks: Track[] = [
  {
    title: 'Seven (basecamp Remix)',
    artist: 'Jung Kook feat. Latto',
    src: '/music/track1.mp3',
  },
  {
    title: 'My jealousy',
    artist: 'DJMAX',
    src: '/music/track2.mp3',
  },
  {
    title: 'Track 03',
    artist: 'AmanaP Selection',
    src: '/music/track3.mp3',
  },
  {
    title: 'Track 04',
    artist: 'AmanaP Selection',
    src: '/music/track4.mp3',
  },
  {
    title: 'Track 05',
    artist: 'AmanaP Selection',
    src: '/music/track5.mp3',
  },
];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

function getRandomTrackIndex(excludeIndex?: number): number {
  if (builtInTracks.length <= 1) return 0;

  let nextIndex = Math.floor(Math.random() * builtInTracks.length);
  while (nextIndex === excludeIndex) {
    nextIndex = Math.floor(Math.random() * builtInTracks.length);
  }

  return nextIndex;
}

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const isSeekingRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const shouldPlayAfterTrackChangeRef = useRef(false);

  const track = builtInTracks[currentTrack];

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;

    audio.addEventListener('timeupdate', () => {
      if (!isSeekingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    });

    const syncDuration = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    audio.addEventListener('loadedmetadata', syncDuration);
    audio.addEventListener('durationchange', syncDuration);

    audio.addEventListener('ended', () => {
      shouldPlayAfterTrackChangeRef.current = true;
      setCurrentTrack((prev) => getRandomTrackIndex(prev));
    });

    audio.addEventListener('error', () => {
      setAudioError('Audio failed to load');
      setIsPlaying(false);
    });

    audio.addEventListener('canplay', () => {
      setAudioError(null);
    });

    audioRef.current = audio;
    return audio;
  }, [volume]);

  const loadTrack = useCallback(
    (shouldPlay: boolean) => {
      const audio = ensureAudio();
      const nextSrc = new URL(track.src, window.location.origin).href;

      if (audio.src !== nextSrc) {
        audio.src = track.src;
        audio.load();
        setCurrentTime(0);
        setDuration(0);
      }

      if (!shouldPlay) return;

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioError(null);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    },
    [ensureAudio, track.src]
  );

  useEffect(() => {
    const handleEnter = () => {
      hasEnteredRef.current = true;
      shouldPlayAfterTrackChangeRef.current = true;
      setCurrentTrack(getRandomTrackIndex(currentTrack));
    };

    window.addEventListener('portfolio-enter', handleEnter, { once: true });

    return () => {
      window.removeEventListener('portfolio-enter', handleEnter);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (hasEnteredRef.current) {
      const shouldPlay = shouldPlayAfterTrackChangeRef.current || isPlaying;
      shouldPlayAfterTrackChangeRef.current = false;
      loadTrack(shouldPlay);
    }
  }, [currentTrack, isPlaying, loadTrack]);

  const togglePlay = useCallback(() => {
    if (!hasEnteredRef.current) {
      hasEnteredRef.current = true;
    }

    const audio = ensureAudio();
    loadTrack(false);

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setAudioError(null);
      })
      .catch(() => {
        setIsPlaying(false);
      });
  }, [ensureAudio, isPlaying, loadTrack]);

  const handleNext = useCallback(() => {
    shouldPlayAfterTrackChangeRef.current = isPlaying;
    setCurrentTrack((value) => getRandomTrackIndex(value));
  }, [isPlaying]);

  const handlePrev = useCallback(() => {
    setCurrentTrack((value) => (value - 1 + builtInTracks.length) % builtInTracks.length);
  }, []);

  const seekToClientX = useCallback(
    (clientX: number) => {
      const audio = audioRef.current;
      const progress = progressRef.current;
      if (!audio || !progress || duration <= 0) return;

      const rect = progress.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const nextTime = percent * duration;
      audio.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [duration]
  );

  const handleProgressPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    isSeekingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    seekToClientX(event.clientX);
  };

  const handleProgressPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return;
    seekToClientX(event.clientX);
  };

  const endSeek = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return;
    seekToClientX(event.clientX);
    isSeekingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 50,
        pointerEvents: 'auto',
      }}
    >
      <style>{`
        @keyframes musicBarBounce {
          0%, 100% { transform: scaleY(0.25); }
          50% { transform: scaleY(1); }
        }
        .music-bar-anim {
          animation: musicBarBounce 0.68s infinite ease-in-out;
          transform-origin: bottom;
        }
      `}</style>

      <div
        style={{
          width: isExpanded ? '360px' : '200px',
          padding: '16px',
          borderRadius: '24px',
          background: 'rgba(5, 5, 5, 0.75)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          color: 'white',
          fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
          transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'rgba(255, 255, 255, 0.4)',
              letterSpacing: '0.1em',
            }}
          >
            MUSIC
          </span>
          <button
            onClick={() => setIsExpanded((value) => !value)}
            aria-label={isExpanded ? 'Collapse music player' : 'Expand music player'}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'rgba(255, 255, 255, 0.68)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >
            {isExpanded ? '-' : '+'}
          </button>
        </div>

        {audioError && isExpanded && (
          <div
            className="mb-3 rounded-lg px-3 py-2 text-xs"
            style={{
              background: 'rgba(200, 50, 50, 0.15)',
              border: '1px solid rgba(200, 50, 50, 0.3)',
              color: 'rgba(255, 150, 150, 0.9)',
            }}
          >
            {audioError}
          </div>
        )}

        <div className="mb-3 flex items-center gap-3">
          <div
            style={{
              width: isExpanded ? '52px' : '36px',
              height: isExpanded ? '52px' : '36px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, hsl(${(currentTrack * 60 + 200) % 360}, 70%, 60%), hsl(${(currentTrack * 60 + 260) % 360}, 70%, 50%))`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.3s ease',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold" style={{ fontSize: isExpanded ? '1em' : '0.85em' }}>
              {track.title}
            </div>
            <div className="truncate" style={{ fontSize: '0.75em', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
              {track.artist}
            </div>
          </div>

          {isExpanded && (
            <div className="flex items-end gap-[2px]" style={{ width: '28px', height: '22px' }}>
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={isPlaying ? 'music-bar-anim' : undefined}
                  style={{
                    width: '3px',
                    height: '18px',
                    borderRadius: '2px',
                    background: 'linear-gradient(180deg, #5c6bc0, #9fa8da)',
                    animationDelay: `${item * 0.1}s`,
                    transform: isPlaying ? undefined : 'scaleY(0.25)',
                    transformOrigin: 'bottom',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {isExpanded && (
          <>
            <div className="mb-3">
              <div className="mb-1 flex justify-between">
                <span style={{ fontSize: '0.7em', color: 'rgba(255,255,255,0.4)' }}>
                  {formatTime(currentTime)}
                </span>
                <span style={{ fontSize: '0.7em', color: 'rgba(255,255,255,0.4)' }}>
                  {formatTime(duration)}
                </span>
              </div>

              <div
                ref={progressRef}
                onPointerDown={handleProgressPointerDown}
                onPointerMove={handleProgressPointerMove}
                onPointerUp={endSeek}
                onPointerCancel={() => {
                  isSeekingRef.current = false;
                }}
                style={{
                  width: '100%',
                  height: '14px',
                  borderRadius: '999px',
                  cursor: duration > 0 ? 'grab' : 'default',
                  position: 'relative',
                  touchAction: 'none',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '5px',
                    height: '4px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '5px',
                    height: '4px',
                    width: `${progressPercent}%`,
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg, #5c6bc0, #9fa8da)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${progressPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button onClick={handlePrev} style={iconButtonStyle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1="5" y1="19" x2="5" y2="5" />
                </svg>
              </button>

              <button
                onClick={togglePlay}
                style={{
                  ...iconButtonStyle,
                  width: '44px',
                  height: '44px',
                  background: 'rgba(92, 107, 192, 0.25)',
                }}
              >
                {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>

              <button onClick={handleNext} style={iconButtonStyle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </button>

              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  {volume > 0 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />}
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(event) => setVolume(parseFloat(event.target.value))}
                  style={{
                    width: '50px',
                    height: '3px',
                    accentColor: '#5c6bc0',
                    cursor: 'pointer',
                  }}
                />
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                title="Import local audio"
                style={{
                  ...iconButtonStyle,
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </button>
            </div>

            <div className="mt-3 space-y-1" style={{ maxHeight: '80px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
              {builtInTracks.map((item, index) => (
                <button
                  key={item.src}
                  onClick={() => setCurrentTrack(index)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left transition-all"
                  style={{
                    background: index === currentTrack ? 'rgba(92, 107, 192, 0.15)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: index === currentTrack ? '#fff' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {index === currentTrack && isPlaying && (
                    <span className="flex items-end gap-[2px]" style={{ height: '10px' }}>
                      {[0, 1, 2].map((bar) => (
                        <span
                          key={bar}
                          className="music-bar-anim"
                          style={{
                            width: '2px',
                            height: '10px',
                            background: '#5c6bc0',
                            borderRadius: '1px',
                            animationDelay: `${bar * 0.12}s`,
                          }}
                        />
                      ))}
                    </span>
                  )}
                  <span className="truncate text-sm">{item.title}</span>
                </button>
              ))}
            </div>

            <input ref={fileInputRef} type="file" accept="audio/*" multiple onChange={() => {}} style={{ display: 'none' }} />
          </>
        )}
      </div>
    </div>
  );
}

const iconButtonStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(255, 255, 255, 0.05)',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};
