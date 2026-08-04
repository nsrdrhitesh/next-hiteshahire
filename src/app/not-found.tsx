import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ink text-center px-6 blueprint-grid">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-circuit mb-4">404</span>
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-paper">This route doesn&apos;t exist.</h1>
      <p className="mt-3 text-paper-dim max-w-sm">
        The page you&apos;re looking for was never deployed. Let&apos;s get you back to something that is.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-signal text-ink font-semibold px-6 py-3 text-sm hover:bg-signal/90 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
