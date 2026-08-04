export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink">
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-paper-dim">
        <span className="w-2 h-2 rounded-full bg-signal animate-pulse-slow" />
        Loading
      </div>
    </div>
  );
}
