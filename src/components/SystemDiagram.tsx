const nodes = [
  { label: "NEXT.JS", x: 60, y: 40 },
  { label: "NESTJS", x: 340, y: 40 },
  { label: "LARAVEL", x: 20, y: 210 },
  { label: "MYSQL", x: 380, y: 210 },
  { label: "PAYMENTS", x: 200, y: 300 },
];

export default function SystemDiagram() {
  return (
    <div className="relative w-full aspect-square max-w-[420px] mx-auto">
      <svg
        viewBox="0 0 420 340"
        className="w-full h-full overflow-visible"
        role="img"
        aria-label="Diagram of Hitesh Ahire's core system architecture: Next.js and NestJS front the stack, Laravel and MySQL handle data, connected through a payments layer."
      >
        {/* connective circuitry */}
        <g fill="none" stroke="var(--circuit)" strokeWidth="1.5" opacity="0.55">
          <path d="M120 60 L210 150" />
          <path d="M300 60 L210 150" />
          <path d="M60 220 L210 150" />
          <path d="M360 220 L210 150" />
          <path d="M210 150 L210 280" />
        </g>
        <g fill="none" stroke="var(--signal)" strokeWidth="2" className="animate-signal">
          <path d="M120 60 L210 150" />
          <path d="M300 60 L210 150" />
          <path d="M60 220 L210 150" />
          <path d="M360 220 L210 150" />
          <path d="M210 150 L210 280" />
        </g>

        {/* core node */}
        <g>
          <circle cx="210" cy="150" r="46" fill="var(--ink-elevated)" stroke="var(--signal)" strokeWidth="1.5" />
          <circle cx="210" cy="150" r="46" fill="var(--signal-soft)" className="animate-pulse-slow" />
          <text
            x="210"
            y="146"
            textAnchor="middle"
            fill="var(--paper)"
            className="font-display"
            fontSize="18"
            fontWeight={700}
          >
            HA
          </text>
          <text
            x="210"
            y="163"
            textAnchor="middle"
            fill="var(--paper-dim)"
            className="font-mono"
            fontSize="8"
            letterSpacing="1.5"
          >
            SYSTEMS
          </text>
        </g>

        {/* satellite nodes */}
        {nodes.map((node) => (
          <g key={node.label}>
            <rect
              x={node.x}
              y={node.y}
              width="100"
              height="40"
              rx="8"
              fill="var(--ink-soft)"
              stroke="var(--line-strong)"
            />
            <circle cx={node.x + 14} cy={node.y + 20} r="3.5" fill="var(--circuit)" />
            <text
              x={node.x + 26}
              y={node.y + 24}
              fill="var(--paper)"
              className="font-mono"
              fontSize="10.5"
              fontWeight={600}
              letterSpacing="0.5"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
