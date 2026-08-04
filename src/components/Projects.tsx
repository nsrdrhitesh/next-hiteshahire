"use client";

import { useMemo, useState } from "react";
import { projects } from "@/lib/data";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";

const tags = ["All", ...Array.from(new Set(projects.map((p) => p.tag)))];

export default function Projects() {
  const [filter, setFilter] = useState("All");

  const visible = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.tag === filter)),
    [filter]
  );

  return (
    <section id="projects" className="py-20 md:py-28 border-t border-line bg-ink-soft/40">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <SectionHeading
            index="04 / Projects"
            title="Twenty-plus live systems. Six worth a closer look."
            className="mb-0"
          />
        </div>

        <Reveal className="flex flex-wrap gap-2 mb-10 -mt-4">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`font-mono text-xs uppercase tracking-wide px-4 py-2 rounded-full border transition-colors ${
                filter === tag
                  ? "bg-signal text-ink border-signal"
                  : "border-line-strong text-paper-dim hover:text-paper hover:border-circuit/50"
              }`}
            >
              {tag}
            </button>
          ))}
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((project, i) => (
            <Reveal key={project.title} delay={i * 60}>
              <article className="h-full flex flex-col rounded-2xl border border-line bg-ink-elevated p-6 hover:border-circuit/50 hover:-translate-y-1 transition-all duration-300">
                <span className="font-mono text-[10.5px] uppercase tracking-wide text-signal">{project.tag}</span>
                <h3 className="mt-2 font-display text-lg font-semibold text-paper">{project.title}</h3>
                <p className="mt-2 text-sm text-paper-dim leading-relaxed flex-1">{project.description}</p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono text-[10px] uppercase tracking-wide rounded-full border border-line-strong px-2.5 py-1 text-paper-faint"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {project.href ? (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-circuit text-sm font-medium hover:underline"
                  >
                    View live
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M3 9l6-6M5 3h4v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                ) : (
                  <span className="mt-5 inline-flex items-center gap-1.5 text-paper-faint text-sm font-medium">
                    Private deployment
                  </span>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
