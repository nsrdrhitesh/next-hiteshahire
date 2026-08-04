import { skillGroups } from "@/lib/data";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";

export default function Skills() {
  return (
    <section id="skills" className="py-20 md:py-28 border-t border-line">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <SectionHeading
          index="03 / Skills"
          title="The stack, broken down by what it's for."
          description="Not a badge wall — the actual tools I reach for at each layer of a system."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillGroups.map((group, i) => (
            <Reveal key={group.label} delay={i * 60}>
              <div className="h-full rounded-2xl border border-line bg-ink-soft p-6 hover:border-circuit/50 transition-colors">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-circuit mb-4">{group.label}</h3>
                <ul className="space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-paper">
                      <span className="w-1 h-1 rounded-full bg-signal shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
