export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
      {/* Central vertical line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-[60vh] bg-gradient-to-b via-zinc-500/5 to-transparent z-10 from-zinc-400/30" />
      
      {/* Top glow spot */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-48 h-56 blur-[100px] rounded-full z-10 bg-zinc-400/10" />
      
      {/* Large ring */}
      <div
        className="absolute -top-[50vh] rounded-[100%] border border-zinc-500/10"
        style={{ width: '150vw', height: '100vh', boxShadow: '0 0 120px rgba(161,161,170,0.1)' }}
      />
      
      {/* Medium ring */}
      <div
        className="absolute top-[20vh] rounded-[100%] border border-zinc-600/5"
        style={{ width: '120vw', height: '120vh', boxShadow: '0 0 80px rgba(161,161,170,0.05)' }}
      />
      
      {/* Left glow */}
      <div className="absolute top-[30%] left-[15%] w-64 h-64 bg-zinc-500/5 blur-[80px] rounded-full" />
      
      {/* Right glow */}
      <div className="absolute bottom-[20%] right-[20%] w-80 h-80 blur-[100px] rounded-full bg-zinc-400/5" />
    </div>
  );
}
