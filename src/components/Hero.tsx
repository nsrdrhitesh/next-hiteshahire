import { profile } from "@/lib/data";
import SystemDiagram from "./SystemDiagram";
import Reveal from "./ui/Reveal";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative pt-32 pb-20 md:pt-44 md:pb-28 blueprint-grid overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink to-ink-soft/40 pointer-events-none" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-signal/10 blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-16 items-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-ink-soft px-4 py-1.5 font-mono text-xs tracking-wide text-circuit uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-circuit animate-pulse-slow" />
              Available for select engagements
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-semibold text-paper leading-[1.05] tracking-tight text-balance">
              Building systems that
              <span className="block text-signal">municipalities and startups</span>
              both trust in production.
            </h1>

            <p className="mt-6 text-paper-dim text-base md:text-lg leading-relaxed max-w-xl">
              I&apos;m {profile.name} — a full stack engineer specializing in{" "}
              <span className="text-paper font-medium">Next.js, NestJS &amp; Laravel</span>. Four years, twenty-plus
              shipped projects, and one government tax platform still standing under real-world load.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full bg-signal text-ink font-semibold px-6 py-3.5 text-sm hover:bg-signal/90 transition-colors"
              >
                Start a project
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="/resume.pdf"
                download
                className="inline-flex items-center gap-2 rounded-full border border-line-strong text-paper font-semibold px-6 py-3.5 text-sm hover:border-circuit hover:text-circuit transition-colors"
              >
                Download Resume
              </a>
              <a
                href="#projects"
                className="inline-flex items-center gap-2 text-paper-dim font-medium px-2 py-3.5 text-sm hover:text-paper transition-colors"
              >
                View Projects →
              </a>
            </div>

            <dl className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-lg border-t border-line pt-8">
              {profile.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-2xl md:text-3xl font-semibold text-paper">{stat.value}</dd>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-wide text-paper-faint">
                    {stat.label}
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={150} className="hidden lg:block">
            <SystemDiagram />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
