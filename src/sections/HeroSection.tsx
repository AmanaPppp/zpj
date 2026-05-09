import { Icon } from '@iconify/react';
import AnimatedCTAButton from '../components/AnimatedCTAButton';

const heroImages = [
  { src: './hero/chrome-sculpture.jpg', className: 'left-0 top-10 h-36 w-32 rotate-[-8deg] md:h-44 md:w-40' },
  { src: './hero/iridescent-ring.jpg', className: 'right-4 top-0 h-32 w-40 rotate-[7deg] md:h-40 md:w-52' },
  { src: './hero/holo-orb.jpg', className: 'left-12 top-48 h-40 w-40 rotate-[4deg] md:left-16 md:top-56 md:h-48 md:w-48' },
  { src: './hero/crystal-prism.jpg', className: 'right-0 top-44 h-44 w-36 rotate-[-5deg] md:h-56 md:w-44' },
  { src: './hero/silk-flow.jpg', className: 'bottom-4 left-24 h-36 w-52 rotate-[5deg] md:h-44 md:w-64' },
  { src: './hero/particle-hand.jpg', className: 'bottom-0 right-16 h-40 w-40 rotate-[-6deg] md:h-52 md:w-52' },
];

const trustItems = ['SOC 2 ready', 'SSO routing', 'On-premise deploys'];

export default function HeroSection() {
  return (
    <section className="relative z-20 min-h-screen px-6 pb-20 pt-32 md:px-12 md:pt-40">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="max-w-3xl animate-on-scroll" style={{ animation: 'animationIn 0.8s ease-out 0.05s both' }}>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-xl">
            <Icon icon="solar:shield-check-linear" className="h-4 w-4 text-emerald-300" />
            Enterprise infrastructure for modern teams
          </div>

          <h1 className="max-w-4xl text-5xl font-medium leading-[0.98] tracking-tight text-white md:text-7xl lg:text-8xl">
            Build secure products without slowing down.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
            Lumina brings authentication, compliance, permissions, workspace controls, and deployment workflows into one polished platform.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <AnimatedCTAButton text="Start Free Trial" className="w-full sm:w-auto" />
            <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-5 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white">
              <Icon icon="solar:play-circle-linear" className="h-5 w-5" />
              Watch Demo
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {trustItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-200 shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative min-h-[620px] animate-on-scroll" style={{ animation: 'animationIn 0.8s ease-out 0.2s both' }}>
          <div className="absolute inset-x-8 top-24 h-80 rounded-full bg-white/[0.06] blur-3xl" />
          {heroImages.map((image, index) => (
            <figure
              key={image.src}
              className={`group absolute overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-1 shadow-2xl shadow-black/50 transition-all duration-500 hover:z-20 hover:scale-105 ${image.className}`}
              style={{ animation: `floatY ${4 + index * 0.25}s ease-in-out infinite ${index * 0.18}s` }}
            >
              <img src={image.src} alt="" className="h-full w-full rounded-[1.25rem] object-cover" />
            </figure>
          ))}

          <div className="absolute left-1/2 top-1/2 z-10 w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/10 bg-[#0e0e11]/75 p-5 shadow-2xl shadow-black/60 backdrop-blur-2xl md:w-[64%]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Lumina OS</p>
                <h2 className="mt-1 text-2xl font-medium tracking-tight text-white">Security posture</h2>
              </div>
              <Icon icon="solar:lock-keyhole-linear" className="h-6 w-6 text-zinc-300" />
            </div>
            <div className="space-y-3">
              {['SSO configured', 'Permissions synced', 'Audit logs active'].map((label, index) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  <span className="text-sm text-zinc-300">{label}</span>
                  <Icon icon="solar:check-circle-bold" className={`h-5 w-5 ${index === 0 ? 'text-emerald-300' : 'text-zinc-300'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
