import { profile } from "@/lib/data";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";

const channels = [
  {
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
  },
  {
    label: "Phone",
    value: profile.phone,
    href: `tel:${profile.phoneHref}`,
  },
  {
    label: "WhatsApp",
    value: "Chat instantly",
    href: profile.whatsapp,
  },
];

const socials = [
  { label: "LinkedIn", href: profile.linkedin },
  { label: "GitHub", href: profile.github },
  { label: "Blog", href: profile.blog },
  { label: "Instagram", href: profile.instagram },
];

export default function Contact() {
  return (
    <section id="contact" className="py-20 md:py-28 border-t border-line bg-ink-soft/40">
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <SectionHeading
          index="06 / Contact"
          title="Have a system that needs building?"
          description="Government platform, SaaS product, or something in between — I take on a limited number of engagements at a time."
          align="center"
        />

        <Reveal className="rounded-3xl border border-line bg-ink-elevated blueprint-grid-fine p-8 md:p-12">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {channels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group rounded-2xl p-5 hover:bg-ink-soft transition-colors"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-ink-soft border border-line-strong flex items-center justify-center text-signal group-hover:border-signal transition-colors">
                  <span className="font-mono text-xs">
                    {channel.label === "Email" ? "@" : channel.label === "Phone" ? "TEL" : "WA"}
                  </span>
                </div>
                <h3 className="mt-3 font-display font-semibold text-paper text-sm">{channel.label}</h3>
                <p className="mt-1 text-xs text-paper-dim break-words">{channel.value}</p>
              </a>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-line text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-paper-faint mb-4">Elsewhere</p>
            <div className="flex flex-wrap justify-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line-strong px-5 py-2.5 text-sm text-paper-dim hover:text-circuit hover:border-circuit transition-colors"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
