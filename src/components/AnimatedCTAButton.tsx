import { Icon } from '@iconify/react';

interface AnimatedCTAButtonProps {
  text: string;
  className?: string;
  size?: 'default' | 'small';
}

export default function AnimatedCTAButton({ text, className = '', size = 'default' }: AnimatedCTAButtonProps) {
  const iconSize = size === 'small' ? 'w-4 h-4' : 'w-4 h-4';
  const textSize = size === 'small' ? 'text-sm' : 'text-sm';

  return (
    <button
      className={`group relative inline-flex cursor-pointer transition-all duration-1000 ease-[cubic-bezier(0.15,0.83,0.66,1)] hover:-translate-y-[2px] overflow-hidden font-normal tracking-tight bg-[#09090b]/80 backdrop-blur-md border rounded-full items-center justify-center hover:text-white text-zinc-300 border-zinc-700/80 ${textSize} ${className}`}
      style={{
        boxShadow: '0 2.8px 2.2px rgba(0,0,0,0.3), 0 6.7px 5.3px rgba(0,0,0,0.35), 0 12.5px 10px rgba(0,0,0,0.4)',
        minWidth: size === 'default' ? '120px' : undefined,
      }}
    >
      {/* Original text (slides down on hover) */}
      <span className="relative z-10 flex items-center gap-2 rounded-full transition-all duration-500 ease-out group-hover:translate-y-8 group-hover:opacity-0 group-hover:blur-md px-5 py-2.5">
        {text}
        <Icon icon="solar:arrow-right-linear" className={iconSize} />
      </span>

      {/* Clone text (slides in from top on hover) */}
      <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 transition-all duration-300 ease-in-out transform -translate-y-8 group-hover:translate-y-0 group-hover:opacity-100 group-hover:blur-none opacity-0 rounded-full blur-md">
        {text}
        <Icon icon="solar:arrow-right-linear" className={iconSize} />
      </span>

      {/* Bottom light gradient line on hover */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 h-[1px] w-[70%] -translate-x-1/2 transition-all duration-1000 ease-[cubic-bezier(0.15,0.83,0.66,1)] opacity-0 group-hover:opacity-80 bg-gradient-to-r from-transparent to-transparent rounded-full blur-[2px] via-neutral-200"
      />

      {/* Bottom light gradient on hover */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[100%] opacity-0 group-hover:opacity-60 transition-all duration-1000 ease-[cubic-bezier(0.15,0.83,0.66,1)] pointer-events-none bg-gradient-to-t to-transparent rounded-full from-white/20 via-white/10"
      />
    </button>
  );
}
