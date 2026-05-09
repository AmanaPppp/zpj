import { Icon } from '@iconify/react';
import AnimatedCTAButton from './AnimatedCTAButton';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Pricing', href: '#pricing' },
];

export default function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-[#050508]/70 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl md:px-6">
        <a href="#" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white text-black">
            <Icon icon="solar:bolt-circle-bold" className="h-5 w-5" />
          </span>
          <span className="text-lg font-medium tracking-tight">Lumina</span>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <AnimatedCTAButton text="Get Started" size="small" />
      </div>
    </header>
  );
}
