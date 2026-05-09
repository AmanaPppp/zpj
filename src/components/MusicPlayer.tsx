import { useRef, useState, useEffect, useCallback } from 'react';

interface Track {
  title: string;
  artist: string;
  src: string;
  duration: number;
}

const builtInTracks: Track[] = [
  {
    title: 'Seven (basecamp Remix)',
    artist: 'Jung Kook feat. Latto',
    src: '/music/track1.mp3',
    duration: 0,
  },
  {
    title: 'My jealousy',
    artist: 'DJMAX',
    src: '/music/track2.mp3',
    duration: 0,
  },
  {
    title: 'Track 03',
    artist: 'AmanaP Selection',
    src: '/music/track3.mp3',
    duration: 0,
  },
  {
    title: 'Track 04',
    artist: 'AmanaP Selection',
    src: '/music/track4.mp3',
    duration: 0,
  },
  {
    title: 'Track 05',
    artist: 'AmanaP Selection',
    src: '/music/track5.mp3',
    duration: 0,
  },
];

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [tracks] = useState<Track[]>(builtInTracks);
  const [volume, setVolume] = useState(0.7);
  const [isExpanded, setIsExpanded] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const track = tracks[currentTrack];

  // --- 核心：创建并管理单一 audio 实例，只换 src 不重建 ---
  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = volume;

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        // 自动下一首
        setCurrentTrack((prev) => (prev + 1) % tracks.length);
      });

      audio.addEventListener('error', (e) => {
        const err = (e.target as HTMLAudioElement).error;
        let msg = '音频加载失败';
        if (err?.code === 4) msg = '音频文件未找到';
        else if (err?.code === 2) msg = '网络错误，无法加载音频';
        else if (err?.code === 3) msg = '音频解码错误';
        setAudioError(msg);
        setIsPlaying(false);
      });

      audio.addEventListener('canplaythrough', () => {
        setAudioError(null);
        // 一旦可以流畅播放，如果用户已交互过，自动开始
        if (hasInteracted || document.visibilityState === 'visible') {
          audio.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      });

      audioRef.current = audio;
    }
    return audioRef.current;
  }, [tracks.length, volume, hasInteracted]);

  // --- 加载当前曲目并立即播放 ---
  const loadAndPlay = useCallback(() => {
    const audio = ensureAudio();

    // 切换 src
    if (audio.src !== window.location.origin + track.src) {
      audio.src = track.src;
      audio.load();
    }

    // 立刻尝试播放，不等任何事件
    const playPromise = audio.play();
    playPromise
      .then(() => {
        setIsPlaying(true);
        setAudioError(null);
      })
      .catch(() => {
        // 被浏览器阻止或还没交互过 —— 没关系，等用户交互后会重试
        setIsPlaying(false);
      });

    return playPromise;
  }, [ensureAudio, track.src]);

  // --- mount 时：立即加载第一首并尝试播放（零延迟）---
  useEffect(() => {
    loadAndPlay();

    // 监听用户第一次交互，然后强制播放
    const onInteract = () => {
      setHasInteracted(true);
      const audio = audioRef.current;
      if (audio && audio.paused) {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    document.addEventListener('click', onInteract, { once: true });
    document.addEventListener('scroll', onInteract, { once: true });
    document.addEventListener('keydown', onInteract, { once: true });
    document.addEventListener('touchstart', onInteract, { once: true });

    return () => {
      document.removeEventListener('click', onInteract);
      document.removeEventListener('scroll', onInteract);
      document.removeEventListener('keydown', onInteract);
      document.removeEventListener('touchstart', onInteract);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []); // eslint-disable-line

  // --- currentTrack 变化时：切换曲目并立即播放 ---
  useEffect(() => {
    loadAndPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  // --- volume 变化 ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = ensureAudio();
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [ensureAudio, isPlaying]);

  const handleNext = useCallback(() => {
    setCurrentTrack((t) => (t + 1) % tracks.length);
  }, [tracks.length]);

  const handlePrev = useCallback(() => {
    setCurrentTrack((t) => (t - 1 + tracks.length) % tracks.length);
  }, [tracks.length]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !track.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * track.duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPercent = track.duration > 0 ? (currentTime / track.duration) * 100 : 0;

  const barHeights = isPlaying
    ? [
        `${4 + Math.abs(Math.sin(Date.now() / 180)) * 14}px`,
        `${4 + Math.abs(Math.sin(Date.now() / 260 + 1.2)) * 14}px`,
        `${4 + Math.abs(Math.sin(Date.now() / 220 + 2.5)) * 14}px`,
        `${4 + Math.abs(Math.sin(Date.now() / 310 + 0.7)) * 14}px`,
      ]
    : ['4px', '4px', '4px', '4px'];

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
        @keyframes barBounce {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .music-bar-anim {
          animation: barBounce 0.6s infinite ease-in-out;
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
          fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
          color: 'white',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
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
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.06)',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        {/* Error */}
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

        {/* Track Info */}
        <div className="flex items-center gap-3 mb-3">
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="truncate font-semibold"
              style={{ fontSize: isExpanded ? '1em' : '0.85em', transition: 'font-size 0.3s' }}
            >
              {track.title}
            </div>
            <div
              className="truncate"
              style={{
                fontSize: '0.75em',
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: '2px',
              }}
            >
              {track.artist}
            </div>
          </div>

          {isExpanded && (
            <div
              className="flex items-end gap-[2px]"
              style={{ width: '28px', height: '22px' }}
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    borderRadius: '2px',
                    background: 'linear-gradient(180deg, #5c6bc0, #9fa8da)',
                    height: barHeights[i],
                    transition: isPlaying ? 'height 0.15s ease' : 'height 0.3s ease',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {isExpanded && (
          <>
            {/* Progress */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: '0.7em', color: 'rgba(255,255,255,0.4)' }}>
                  {formatTime(currentTime)}
                </span>
                <span style={{ fontSize: '0.7em', color: 'rgba(255,255,255,0.4)' }}>
                  {formatTime(track.duration)}
                </span>
              </div>

              <div
                onClick={handleProgressClick}
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #5c6bc0, #9fa8da)',
                    borderRadius: '2px',
                    transition: 'width 0.05s linear',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${progressPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '10px',
                    height: '10px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
                    transition: 'left 0.05s linear',
                  }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handlePrev}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1="5" y1="19" x2="5" y2="5" />
                </svg>
              </button>

              <button
                onClick={togglePlay}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(92, 107, 192, 0.25)',
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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

              <button
                onClick={handleNext}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
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
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
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
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  color: 'rgba(255, 255, 255, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="导入本地音频"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </button>
            </div>

            {/* Track List */}
            <div className="mt-3 space-y-1" style={{ maxHeight: '80px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
              {tracks.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTrack(i)}
                  className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all"
                  style={{
                    background: i === currentTrack ? 'rgba(92, 107, 192, 0.15)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: i === currentTrack ? '#fff' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {i === currentTrack && isPlaying && (
                    <span className="flex gap-[2px] items-end" style={{ height: '10px' }}>
                      {[0, 1, 2].map((j) => (
                        <span
                          key={j}
                          className="music-bar-anim"
                          style={{
                            width: '2px',
                            background: '#5c6bc0',
                            borderRadius: '1px',
                            height: '4px',
                            animationDelay: `${j * 0.12}s`,
                          }}
                        />
                      ))}
                    </span>
                  )}
                  <span className="truncate text-sm">{t.title}</span>
                </button>
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              multiple
              onChange={() => {}}
              style={{ display: 'none' }}
            />
          </>
        )}
      </div>
    </div>
  );
}
