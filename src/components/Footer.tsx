import { nav, profile } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <div className="max-w-6xl mx-auto px-5 md:px-8 flex flex-col items-center gap-5 text-center">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <a href="#home" className="text-paper-dim hover:text-paper transition-colors">
            Home
          </a>
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="text-paper-dim hover:text-paper transition-colors">
              {item.label}
            </a>
          ))}
        </div>
        <p className="text-sm text-paper-dim">
          © {new Date().getFullYear()} <span className="text-paper font-medium">{profile.name}</span> — Full Stack
          Software Developer. All rights reserved.
        </p>
        <p className="font-mono text-xs text-paper-faint">
          📍 {profile.location} · Serving clients worldwide
        </p>
      </div>
    </footer>
  );
}
