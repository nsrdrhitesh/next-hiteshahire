"use client";

import { useEffect, useState } from "react";
import { nav, profile } from "@/lib/data";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = nav
      .map((item) => document.querySelector(item.href))
      .filter((el): el is Element => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-ink/85 backdrop-blur-lg border-b border-line" : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-5 md:px-8 h-16 md:h-[72px] flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2 font-display font-semibold text-lg text-paper">
          <span className="w-2 h-2 rounded-full bg-signal animate-pulse-slow" aria-hidden />
          Hitesh<span className="text-paper-dim">.dev</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                active === item.href ? "text-signal" : "text-paper-dim hover:text-paper"
              }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/resume.pdf"
            download
            className="inline-flex items-center gap-2 rounded-full bg-signal text-ink text-sm font-semibold px-4 py-2 hover:bg-signal/90 transition-colors"
          >
            Download Resume
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-line text-paper"
        >
          <span className="relative w-5 h-4 block">
            <span
              className={`absolute left-0 top-0 h-[1.5px] w-5 bg-current transition-transform ${
                open ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-[1.5px] w-5 bg-current transition-opacity ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 top-[14px] h-[1.5px] w-5 bg-current transition-transform ${
                open ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </nav>

      {open ? (
        <div className="md:hidden bg-ink border-t border-line px-5 py-6 flex flex-col gap-1">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="px-3 py-3 rounded-lg text-paper-dim hover:text-paper hover:bg-ink-elevated transition-colors text-sm font-medium"
            >
              {item.label}
            </a>
          ))}
          <a
            href="/resume.pdf"
            download
            onClick={() => setOpen(false)}
            className="mt-2 text-center rounded-full bg-signal text-ink text-sm font-semibold px-4 py-3"
          >
            Download Resume
          </a>
          <a
            href={profile.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-center rounded-full border border-line text-paper text-sm font-medium px-4 py-3"
          >
            Message on WhatsApp
          </a>
        </div>
      ) : null}
    </header>
  );
}
