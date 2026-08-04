import { experience } from "@/lib/data";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";

export default function Experience() {
  return (
    <section id="experience" className="py-20 md:py-28 border-t border-line bg-ink-soft/40">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <SectionHeading
          index="02 / Experience"
          title="Four roles, one steady climb toward ownership."
          description="From CRUD internship to leading the engineering behind a municipal tax platform, and now architecting SaaS at scale."
        />

        <div className="relative max-w-3xl">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-line-strong" aria-hidden />

          <div className="space-y-10">
            {experience.map((job, i) => (
              <Reveal key={job.company} delay={i * 80} className="relative pl-9">
                <span
                  className={`absolute left-0 top-2 w-[15px] h-[15px] rounded-full border-2 ${
                    job.current ? "bg-signal border-signal" : "bg-ink border-line-strong"
                  }`}
                  aria-hidden
                />

                <div className="rounded-2xl border border-line bg-ink-elevated p-6 md:p-7 hover:border-line-strong transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className="font-display text-lg md:text-xl font-semibold text-paper">{job.role}</h3>
                    <span
                      className={`font-mono text-[11px] tracking-wide uppercase px-3 py-1 rounded-full whitespace-nowrap ${
                        job.current ? "bg-signal-soft text-signal" : "bg-ink-soft text-paper-faint border border-line"
                      }`}
                    >
                      {job.period}
                    </span>
                  </div>
                  <p className="text-circuit font-medium text-sm">
                    {job.company} <span className="text-paper-faint">· {job.location}</span>
                  </p>

                  <ul className="mt-4 space-y-2">
                    {job.points.map((point) => (
                      <li key={point} className="flex gap-3 text-sm text-paper-dim leading-relaxed">
                        <span className="mt-2 w-1 h-1 rounded-full bg-paper-faint shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {job.stack.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[10.5px] uppercase tracking-wide rounded-full border border-line-strong px-2.5 py-1 text-paper-dim"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
