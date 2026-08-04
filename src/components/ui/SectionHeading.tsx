import Reveal from "./Reveal";

export default function SectionHeading({
  index,
  title,
  description,
  align = "left",
  className = "",
}: {
  index: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={`mb-12 md:mb-16 ${align === "center" ? "text-center mx-auto" : ""} ${className}`}
    >
      <div
        className={`flex items-center gap-3 text-circuit font-mono text-xs tracking-[0.25em] uppercase mb-4 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className="h-px w-8 bg-circuit/60" />
        {index}
      </div>
      <h2 className="font-display text-3xl sm:text-4xl md:text-[2.75rem] font-semibold text-paper tracking-tight text-balance">
        {title}
      </h2>
      {description ? (
        <p className={`mt-4 text-paper-dim text-base md:text-lg max-w-2xl leading-relaxed ${align === "center" ? "mx-auto" : ""}`}>
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
