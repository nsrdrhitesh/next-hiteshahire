import { profile } from "@/lib/data";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";

const highlights = [
  "20+ enterprise deployments shipped end to end",
  "MSc in Computer Science",
  "Laravel & Java certified",
  "Team lead on 6+ engineer squads",
];

export default function About() {
  return (
    <section id="about" className="py-20 md:py-28 border-t border-line">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <SectionHeading index="01 / About" title="An engineer who ships infrastructure, not demos." />

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
          <Reveal>
            <div className="rounded-2xl border border-line bg-ink-soft p-7 blueprint-grid-fine">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-ink-elevated border border-line-strong flex items-center justify-center font-display text-xl font-semibold text-signal">
                  HA
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-paper">{profile.name}</h3>
                  <p className="text-paper-dim text-sm">{profile.role}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Next.js", "NestJS", "Laravel", "React"].map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[11px] uppercase tracking-wide rounded-full border border-line-strong px-3 py-1 text-circuit"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 space-y-2 text-sm text-paper-dim">
                <div className="flex items-center gap-2">
                  <span className="text-paper-faint font-mono text-xs w-20 shrink-0">LOCATION</span>
                  {profile.location}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-paper-faint font-mono text-xs w-20 shrink-0">LANGUAGES</span>
                  English, Hindi, Marathi
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-line grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="font-display text-lg font-semibold text-paper">4+</div>
                  <div className="font-mono text-[10px] uppercase text-paper-faint tracking-wide">Years</div>
                </div>
                <div>
                  <div className="font-display text-lg font-semibold text-paper">20+</div>
                  <div className="font-mono text-[10px] uppercase text-paper-faint tracking-wide">Projects</div>
                </div>
                <div>
                  <div className="font-display text-lg font-semibold text-paper">100%</div>
                  <div className="font-mono text-[10px] uppercase text-paper-faint tracking-wide">Delivery</div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <p className="text-paper-dim text-base md:text-lg leading-relaxed">{profile.summary}</p>

            <ul className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-paper">
                  <svg className="mt-0.5 shrink-0 text-signal" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-8 text-paper-dim text-sm md:text-base leading-relaxed">
              Currently leading full-stack delivery at <strong className="text-paper font-medium">DMS Genix</strong> on
              large-scale matrimony platforms. Previously ran the engineering team behind the{" "}
              <strong className="text-paper font-medium">NMC Water Tax System</strong> at Nullplex. I also write about
              AI-assisted development, PHP, and Next.js on{" "}
              <a href={profile.blog} target="_blank" rel="noopener noreferrer" className="text-circuit hover:underline">
                SustainixSH
              </a>
              .
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="rounded-full bg-signal text-ink text-sm font-semibold px-6 py-3 hover:bg-signal/90 transition-colors"
              >
                Let&apos;s talk
              </a>
              <a
                href={profile.blog}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-line-strong text-paper text-sm font-medium px-6 py-3 hover:border-circuit hover:text-circuit transition-colors"
              >
                Visit the blog
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
