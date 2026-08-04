import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@/lib/data";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = profile.site;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} | Full Stack Software Developer — Next.js, NestJS, Laravel`,
    template: `%s | ${profile.name}`,
  },
  description:
    "Hitesh Ahire — Full Stack Software Developer with 4+ years of experience in Next.js, NestJS, Laravel, React and Vue. 20+ enterprise projects delivered including a government water-tax system and multi-tenant matrimony platforms. Based in Nashik, India.",
  keywords: [
    "Hitesh Ahire",
    "Full Stack Developer Nashik",
    "Next.js Developer",
    "NestJS Developer",
    "Laravel Developer",
    "React Developer India",
    "Vue.js Developer",
    "Software Engineer Nashik",
  ],
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  robots: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: `${profile.name} — Full Stack Developer`,
    title: `${profile.name} | Full Stack Software Developer`,
    description:
      "Building scalable web applications and enterprise systems with Next.js, NestJS and Laravel. 20+ live projects across government, SaaS, and fintech.",
    locale: "en_IN",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: profile.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} | Full Stack Software Developer`,
    description:
      "4+ years shipping Next.js, NestJS and Laravel systems — from government infrastructure to high-traffic SaaS.",
    images: ["/og-image.png"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: siteUrl,
  jobTitle: "Full Stack Software Developer",
  worksFor: { "@type": "Organization", name: "DMS Genix" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nashik",
    addressRegion: "Maharashtra",
    addressCountry: "India",
  },
  email: profile.email,
  telephone: profile.phoneHref,
  knowsAbout: [
    "Next.js",
    "NestJS",
    "React",
    "Vue.js",
    "Laravel",
    "Node.js",
    "MySQL",
    "PostgreSQL",
    "RESTful APIs",
    "Microservices",
    "TypeScript",
    "Tailwind CSS",
  ],
  sameAs: [profile.linkedin, profile.github, profile.instagram, profile.blog],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
