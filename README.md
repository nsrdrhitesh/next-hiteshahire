# Hitesh Ahire — Portfolio (Next.js 15 / TypeScript / Tailwind v4)

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Before you deploy

1. **Resume** — drop your real PDF at `public/resume.pdf` (the Navbar and Hero
   "Download Resume" buttons already link to it).
2. **OG image** — add a 1200×630 image at `public/og-image.png` for social
   share previews (LinkedIn, Twitter/X, WhatsApp link unfurls).
3. **Domain** — `profile.site` in `src/lib/data.ts` is set to
   `https://hiteshahire.in`. Update it if that changes, since metadata,
   the sitemap, and the JSON-LD schema all read from it.
4. **Content** — every section pulls from `src/lib/data.ts`. Edit that one
   file to update experience, projects, skills, or contact details — no
   need to touch the components.

## Structure

```
src/
  app/            route-level files: layout, page, sitemap, robots, loading, 404
  components/     one file per section (Hero, About, Experience, ...)
  components/ui/  small shared primitives (Reveal, SectionHeading)
  lib/data.ts     all resume content — the only file you should need to edit often
public/
  resume.pdf      <- add your resume here
  og-image.png    <- add a 1200x630 share image here
```

## Design notes

- Dark "blueprint" theme (ink navy + amber signal + circuit teal) instead of
  the generic light-glassmorphism-blue look most AI-generated portfolios
  default to — chosen to read as "systems engineer," matching the
  government/infra work in the resume.
- The hero graphic is a hand-built SVG system diagram (Next.js → NestJS →
  Laravel → MySQL → Payments, wired through a central node), not a stock
  particle animation.
- Scroll reveals use a tiny IntersectionObserver-based component
  (`components/ui/Reveal.tsx`) — no animation library dependency, respects
  `prefers-reduced-motion`.
- Fully keyboard-navigable with visible focus states; Lighthouse-friendly
  (no client JS on the SVG diagram, fonts loaded via `next/font`, images
  ready for `next/image` if you add real project screenshots).

## Want more?

Natural next steps if you want to keep going: swap the project cards' text
icons for real screenshots via `next/image`, add a light-mode toggle, wire
the contact section to a real form (Resend/Formspree), or add an MDX-backed
blog route that pulls your SustainixSH posts.
