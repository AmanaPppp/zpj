import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const displayFont = "'Swis721 Blk BT', 'Swis721 Blk BT Black', 'Arial Black', 'Montserrat', sans-serif";
const chineseFont = "'Source Han Sans CN', 'Source Han Sans SC', 'Noto Sans CJK SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
const accent = '#7b1f3e';
const skillIntroLift = 'clamp(110px, 16vh, 190px)';
const designerWords = Array.from({ length: 8 }, (_, index) => `Designer-${index}`);

function DesignerLoopFrame({ placement = 'upper' }: { placement?: 'upper' | 'lower' | 'beside-three' }) {
  const renderWords = (prefix: string) =>
    designerWords.map((key) => (
      <span className="designer-loop-word" key={`${prefix}-${key}`}>
        Designer
      </span>
    ));

  return (
    <div className={`designer-loop-frame designer-loop-frame-${placement}`} aria-hidden="true">
      <style>
        {`
          .designer-loop-frame {
            position: absolute;
            right: clamp(28px, 4vw, 72px);
            top: calc(clamp(132px, 17vh, 190px) - ${skillIntroLift});
            width: min(32vw, 642px);
            aspect-ratio: 1.34;
            z-index: 11;
            pointer-events: none;
            color: ${accent};
            font-family: ${displayFont};
            font-weight: 900;
            letter-spacing: -0.03em;
            text-transform: none;
          }

          .designer-loop-frame-lower {
            right: auto;
            left: clamp(1020px, 52vw, 1180px);
            top: calc(clamp(650px, 63vh, 760px) - ${skillIntroLift});
            width: min(32vw, 642px);
          }

          .designer-loop-frame-beside-three {
            right: auto;
            left: clamp(160px, 21vw, 420px);
            top: calc(clamp(1180px, 138vh, 1460px) - ${skillIntroLift});
            width: min(34vw, 642px);
          }

          .designer-loop-core {
            position: absolute;
            inset: clamp(26px, 1.75vw, 36px);
            background: #000;
          }

          .designer-loop-strip {
            position: absolute;
            overflow: hidden;
            background: #fff;
            z-index: 2;
          }

          .designer-loop-strip.horizontal {
            left: 0;
            right: 0;
            height: clamp(26px, 1.75vw, 36px);
          }

          .designer-loop-strip.top {
            top: 0;
          }

          .designer-loop-strip.bottom {
            bottom: 0;
          }

          .designer-loop-strip.vertical {
            top: 0;
            bottom: 0;
            width: clamp(26px, 1.75vw, 36px);
          }

          .designer-loop-strip.left {
            left: 0;
          }

          .designer-loop-strip.right {
            right: 0;
          }

          .designer-loop-track {
            display: flex;
            width: max-content;
            height: 100%;
            will-change: transform;
          }

          .designer-loop-track.x-forward {
            animation: designerLoopX 8s linear infinite;
          }

          .designer-loop-track.x-reverse {
            animation: designerLoopXReverse 8s linear infinite;
          }

          .designer-loop-track.y-forward,
          .designer-loop-track.y-reverse {
            flex-direction: column;
            width: 100%;
            height: max-content;
          }

          .designer-loop-track.y-forward {
            animation: designerLoopY 8.5s linear infinite;
          }

          .designer-loop-track.y-reverse {
            animation: designerLoopYReverse 8.5s linear infinite;
          }

          .designer-loop-group {
            display: flex;
            flex: 0 0 auto;
          }

          .designer-loop-group.vertical {
            flex-direction: column;
            width: 100%;
            align-items: center;
          }

          .designer-loop-word {
            display: block;
            flex: 0 0 auto;
            padding: 0 clamp(8px, 0.75vw, 15px);
            font-size: clamp(22px, 1.75vw, 34px);
            line-height: clamp(26px, 1.75vw, 36px);
            white-space: nowrap;
          }

          .designer-loop-group.vertical .designer-loop-word {
            writing-mode: vertical-rl;
            text-orientation: mixed;
            padding: clamp(8px, 0.75vw, 15px) 0;
            font-size: clamp(21px, 1.62vw, 32px);
            line-height: clamp(26px, 1.75vw, 36px);
          }

          @keyframes designerLoopX {
            from { transform: translate3d(0, 0, 0); }
            to { transform: translate3d(-50%, 0, 0); }
          }

          @keyframes designerLoopXReverse {
            from { transform: translate3d(-50%, 0, 0); }
            to { transform: translate3d(0, 0, 0); }
          }

          @keyframes designerLoopY {
            from { transform: translate3d(0, 0, 0); }
            to { transform: translate3d(0, -50%, 0); }
          }

          @keyframes designerLoopYReverse {
            from { transform: translate3d(0, -50%, 0); }
            to { transform: translate3d(0, 0, 0); }
          }

          @media (max-width: 1200px) {
            .designer-loop-frame-upper {
              right: 28px;
              width: min(36vw, 520px);
            }

            .designer-loop-frame-lower {
              left: min(52vw, 1180px);
              width: min(36vw, 520px);
            }
          }
        `}
      </style>

      <div className="designer-loop-core" />

      <div className="designer-loop-strip horizontal top">
        <div className="designer-loop-track x-forward">
          <div className="designer-loop-group">{renderWords('top-a')}</div>
          <div className="designer-loop-group">{renderWords('top-b')}</div>
        </div>
      </div>

      <div className="designer-loop-strip horizontal bottom">
        <div className="designer-loop-track x-reverse">
          <div className="designer-loop-group">{renderWords('bottom-a')}</div>
          <div className="designer-loop-group">{renderWords('bottom-b')}</div>
        </div>
      </div>

      <div className="designer-loop-strip vertical left">
        <div className="designer-loop-track y-forward">
          <div className="designer-loop-group vertical">{renderWords('left-a')}</div>
          <div className="designer-loop-group vertical">{renderWords('left-b')}</div>
        </div>
      </div>

      <div className="designer-loop-strip vertical right">
        <div className="designer-loop-track y-reverse">
          <div className="designer-loop-group vertical">{renderWords('right-a')}</div>
          <div className="designer-loop-group vertical">{renderWords('right-b')}</div>
        </div>
      </div>
    </div>
  );
}

function SkillDetailTwo() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 'calc(clamp(24px, 3vw, 56px) + 8px)',
        top: `calc(clamp(535px, 66vh, 720px) - ${skillIntroLift})`,
        width: 'min(760px, 42vw)',
        height: '260px',
        zIndex: 11,
        color: '#fff',
        fontFamily: displayFont,
        fontWeight: 900,
        letterSpacing: '-0.025em',
        textTransform: 'uppercase',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          fontSize: 'clamp(74px, 5.4vw, 118px)',
          lineHeight: 0.74,
          whiteSpace: 'nowrap',
        }}
      >
        02
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 'clamp(84px, 6.5vw, 122px)',
          width: 'clamp(72px, 5.6vw, 116px)',
          height: '5px',
          background: accent,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 'clamp(112px, 8.6vw, 164px)',
          fontSize: 'clamp(48px, 4.3vw, 82px)',
          lineHeight: 0.82,
          whiteSpace: 'nowrap',
        }}
      >
        I'M&nbsp; A
      </div>

      <div
        style={{
          position: 'absolute',
          left: 'clamp(200px, 17.4vw, 286px)',
          top: 'clamp(132px, 9.8vw, 186px)',
          fontFamily: chineseFont,
          fontSize: 'clamp(24px, 2.05vw, 36px)',
          fontWeight: 700,
          lineHeight: 1,
          color: 'rgba(255, 255, 255, 0.72)',
          letterSpacing: '0',
          textTransform: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        我就是那个......
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 'clamp(190px, 14.1vw, 250px)',
          fontSize: 'clamp(38px, 3.7vw, 64px)',
          lineHeight: 0.9,
          color: accent,
          textTransform: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        VI Design
      </div>

      <div
        style={{
          position: 'absolute',
          left: 'clamp(246px, 21vw, 350px)',
          top: 'clamp(207px, 15.4vw, 269px)',
          fontFamily: chineseFont,
          fontSize: 'clamp(20px, 1.7vw, 30px)',
          fontWeight: 700,
          lineHeight: 1,
          color: 'rgba(255, 255, 255, 0.72)',
          letterSpacing: '0',
          textTransform: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        VI设计
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 'clamp(270px, 19.4vw, 342px)',
          fontSize: 'clamp(35px, 3.5vw, 60px)',
          lineHeight: 0.9,
          color: accent,
          textTransform: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Brand Visual Guidelines
      </div>

      <div
        style={{
          position: 'absolute',
          left: 'clamp(610px, 52vw, 790px)',
          top: 'clamp(285px, 20.6vw, 359px)',
          fontFamily: chineseFont,
          fontSize: 'clamp(20px, 1.7vw, 30px)',
          fontWeight: 700,
          lineHeight: 1,
          color: 'rgba(255, 255, 255, 0.72)',
          letterSpacing: '0',
          textTransform: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        品牌视觉规范
      </div>
    </div>
  );
}

function SkillDetailThree() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: 'clamp(28px, 4vw, 72px)',
        top: `calc(clamp(535px, 66vh, 720px) + clamp(535px, 66vh, 720px) - 7vh - ${skillIntroLift})`,
        width: 'min(860px, 58vw)',
        height: '360px',
        zIndex: 11,
        color: '#fff',
        fontFamily: displayFont,
        fontWeight: 900,
        letterSpacing: '-0.025em',
        textTransform: 'uppercase',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          fontSize: 'clamp(74px, 5.4vw, 118px)',
          lineHeight: 0.74,
          whiteSpace: 'nowrap',
        }}
      >
        03
      </div>

      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 'clamp(84px, 6.5vw, 122px)',
          width: 'clamp(72px, 5.6vw, 116px)',
          height: '5px',
          background: accent,
        }}
      />

      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 'clamp(112px, 8.6vw, 164px)',
          fontSize: 'clamp(48px, 4.3vw, 82px)',
          lineHeight: 0.82,
          whiteSpace: 'nowrap',
        }}
      >
        I'M&nbsp; A
      </div>

      <div
        style={{
          position: 'absolute',
          right: 'clamp(210px, 19vw, 300px)',
          top: 'clamp(128px, 9.8vw, 186px)',
          fontFamily: chineseFont,
          fontSize: 'clamp(24px, 2.05vw, 36px)',
          fontWeight: 700,
          lineHeight: 1,
          color: 'rgba(255, 255, 255, 0.72)',
          letterSpacing: '0',
          textTransform: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        我就是那个......
      </div>

      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 'clamp(190px, 14.1vw, 250px)',
          fontSize: 'clamp(38px, 3.7vw, 64px)',
          lineHeight: 0.9,
          color: accent,
          textTransform: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        IP Design
      </div>

      <div
        style={{
          position: 'absolute',
          right: 'clamp(250px, 22vw, 350px)',
          top: 'clamp(207px, 15.4vw, 269px)',
          fontFamily: chineseFont,
          fontSize: 'clamp(20px, 1.7vw, 30px)',
          fontWeight: 700,
          lineHeight: 1,
          color: 'rgba(255, 255, 255, 0.72)',
          letterSpacing: '0',
          textTransform: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        VI设计
      </div>

      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 'clamp(270px, 19.4vw, 342px)',
          display: 'flex',
          alignItems: 'baseline',
          gap: 'clamp(18px, 1.4vw, 28px)',
          textTransform: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            fontFamily: chineseFont,
            fontSize: 'clamp(20px, 1.7vw, 30px)',
            fontWeight: 700,
            lineHeight: 1,
            color: 'rgba(255, 255, 255, 0.72)',
            letterSpacing: '0',
          }}
        >
          品牌与企业形象
        </span>
        <span
          style={{
            fontSize: 'clamp(35px, 3.5vw, 60px)',
            lineHeight: 0.9,
            color: accent,
          }}
        >
          Intellectual Property
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          display: 'none',
          right: 'clamp(470px, 40vw, 610px)',
          top: 'clamp(285px, 20.6vw, 359px)',
          fontFamily: chineseFont,
          fontSize: 'clamp(20px, 1.7vw, 30px)',
          fontWeight: 700,
          lineHeight: 1,
          color: 'rgba(255, 255, 255, 0.72)',
          letterSpacing: '0',
          textTransform: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        品牌与企业形象
      </div>
    </div>
  );
}

export default function SkillsIntroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lockupRef.current,
        { y: 58, autoAlpha: 0, filter: 'blur(10px)' },
        {
          y: 0,
          autoAlpha: 1,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{
        minHeight: '58vh',
        padding: '7vh clamp(24px, 3vw, 56px) 125vh',
        zIndex: 10,
        overflow: 'visible',
      }}
    >
      <div
        ref={lockupRef}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'clamp(60px, 8vw, 150px)',
          marginTop: `calc(0px - ${skillIntroLift})`,
          color: '#fff',
          fontFamily: displayFont,
          fontWeight: 900,
          letterSpacing: '-0.025em',
          textTransform: 'uppercase',
        }}
      >
        <div
          style={{
            position: 'relative',
            flex: '0 0 auto',
            width: '831px',
            height: '378px',
            maxWidth: 'min(831px, 52vw)',
            transformOrigin: '0 0',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '8px',
              top: '20px',
              fontFamily: chineseFont,
              fontSize: '45px',
              fontWeight: 700,
              lineHeight: 0.95,
              color: 'rgba(255, 255, 255, 0.72)',
              textTransform: 'none',
            }}
          >
            什么
          </div>

          <div
            style={{
              position: 'absolute',
              left: '14px',
              top: '80px',
              fontSize: '76px',
              lineHeight: 0.78,
              whiteSpace: 'nowrap',
            }}
          >
            WHAT
          </div>

          <div
            style={{
              position: 'absolute',
              left: '284px',
              top: '80px',
              fontSize: '76px',
              lineHeight: 0.78,
              color: accent,
              whiteSpace: 'nowrap',
            }}
          >
            SKILLS
          </div>

          <div
            style={{
              position: 'absolute',
              left: '497px',
              top: '153px',
              fontFamily: chineseFont,
              fontSize: '41px',
              fontWeight: 700,
              lineHeight: 0.95,
              color: 'rgba(255, 255, 255, 0.72)',
              textTransform: 'none',
            }}
          >
            技能
          </div>

          <div
            style={{
              position: 'absolute',
              left: '232px',
              top: '226px',
              fontSize: '76px',
              lineHeight: 0.82,
              whiteSpace: 'nowrap',
            }}
          >
            DO I HAVE
          </div>

          <div
            style={{
              position: 'absolute',
              left: '236px',
              top: '305px',
              fontFamily: chineseFont,
              fontSize: '41px',
              fontWeight: 700,
              lineHeight: 0.95,
              color: 'rgba(255, 255, 255, 0.72)',
              textTransform: 'none',
            }}
          >
            我有吗
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            flex: '0 0 auto',
            width: '770px',
            height: '482px',
            maxWidth: 'min(770px, 46vw)',
            marginLeft: '-88px',
            marginTop: 'clamp(32px, 4vh, 54px)',
            transform: 'scale(0.88)',
            transformOrigin: '0 0',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '94px',
              top: '58px',
              fontSize: '118px',
              lineHeight: 0.75,
              whiteSpace: 'nowrap',
            }}
          >
            01
          </div>

          <div
            style={{
              position: 'absolute',
              left: '92px',
              top: '176px',
              width: '83px',
              height: '5px',
              background: accent,
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: '93px',
              top: '201px',
              fontSize: '78px',
              lineHeight: 0.85,
              whiteSpace: 'nowrap',
            }}
          >
            I'M&nbsp; A
          </div>

          <div
            style={{
              position: 'absolute',
              left: '388px',
              top: '227px',
              fontFamily: chineseFont,
              fontSize: '35px',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '0',
              color: 'rgba(255, 255, 255, 0.72)',
              textTransform: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            我就是那个……
          </div>

          <div
            style={{
              position: 'absolute',
              left: '96px',
              top: '300px',
              fontSize: '57px',
              lineHeight: 0.95,
              color: accent,
              whiteSpace: 'nowrap',
            }}
          >
            Weird and Wacky
          </div>

          <div
            style={{
              position: 'absolute',
              left: '724px',
              top: '321px',
              fontFamily: chineseFont,
              fontSize: '27px',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '0',
              color: 'rgba(255, 255, 255, 0.72)',
              textTransform: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            奇奇怪怪
          </div>

          <div
            style={{
              position: 'absolute',
              left: '98px',
              top: '393px',
              fontSize: '57px',
              lineHeight: 0.95,
              color: accent,
              whiteSpace: 'nowrap',
            }}
          >
            Brand Designer
          </div>

          <div
            style={{
              position: 'absolute',
              left: '696px',
              top: '414px',
              fontFamily: chineseFont,
              fontSize: '27px',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '0',
              color: 'rgba(255, 255, 255, 0.72)',
              textTransform: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            品牌设计师
          </div>
        </div>
      </div>

      <SkillDetailTwo />
      <SkillDetailThree />
      <DesignerLoopFrame />
      <DesignerLoopFrame placement="lower" />
      <DesignerLoopFrame placement="beside-three" />
    </section>
  );
}
