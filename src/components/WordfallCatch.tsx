export function WordfallCatch({ x, y }: { x: number; y: number }) {
  return <div aria-hidden="true" className="wordfall-burst pointer-events-none absolute z-30" style={{ left: `${x}%`, top: `${y}%` }}>
    <span className="wordfall-catch-ring absolute h-16 w-16 rounded-full border-2 border-secondary" />
    {Array.from({ length: 12 }, (_, i) => <span key={i} className="wordfall-spark absolute h-1.5 w-1.5 rounded-sm bg-secondary" style={{ transform: `rotate(${i * 30}deg)` }}><span className="block h-full w-full rounded-sm bg-accent-foreground" /></span>)}
  </div>;
}