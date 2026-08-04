import { certifications, education } from "@/lib/data";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";

export default function Education() {
  return (
    <section id="education" className="py-20 md:py-28 border-t border-line">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <SectionHeading index="05 / Education" title="Formal grounding, kept current with certification." />

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl">
          {education.map((item, i) => (
            <Reveal key={item.degree} delay={i * 80}>
              <div className="h-full rounded-2xl border border-line bg-ink-soft p-6">
                <span className="font-mono text-[11px] uppercase tracking-wide text-paper-faint">{item.period}</span>
                <h3 className="mt-2 font-display text-lg font-semibold text-paper">{item.degree}</h3>
                <p className="text-circuit text-sm mt-0.5">{item.school}</p>
                <p className="mt-3 text-sm text-paper-dim leading-relaxed">{item.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={160} className="mt-8 flex flex-wrap gap-2.5 max-w-4xl">
          {certifications.map((cert) => (
            <span
              key={cert}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-ink-elevated px-4 py-2 text-xs text-paper-dim"
            >
              <svg className="text-signal shrink-0" width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M6.5 1l1.4 2.9 3.2.5-2.3 2.3.5 3.2-2.8-1.5-2.8 1.5.5-3.2L2 4.4l3.2-.5L6.5 1z"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
              {cert}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
