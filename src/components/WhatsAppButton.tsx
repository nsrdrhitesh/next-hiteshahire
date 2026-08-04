import { profile } from "@/lib/data";

export default function WhatsAppButton() {
  return (
    <a
      href={`${profile.whatsapp}?text=Hi%20Hitesh%2C%20I%27m%20interested%20in%20hiring%20you`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 md:bottom-7 md:right-7 z-40 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.35)] hover:scale-110 hover:-rotate-6 transition-transform"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.36a9.9 9.9 0 0 0 4.62 1.14h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.09c-.25.7-1.24 1.28-2.03 1.44-.55.12-1.26.21-3.66-.79-2.98-1.24-4.89-4.28-5.04-4.48-.15-.2-1.21-1.61-1.21-3.07s.75-2.17 1.02-2.47c.25-.28.55-.34.73-.34.19 0 .37.002.53.01.17.008.4-.065.62.48.25.62.85 2.14.92 2.29.08.16.13.34.02.55-.1.2-.16.33-.31.5-.16.18-.33.4-.47.54-.16.16-.32.32-.14.63.19.31.83 1.37 1.78 2.22 1.23 1.09 2.26 1.44 2.58 1.6.31.16.5.13.68-.08.19-.21.79-.92 1-1.24.2-.31.4-.26.68-.16.28.11 1.79.85 2.1 1 .31.16.51.24.59.36.08.13.08.75-.17 1.45z" />
      </svg>
    </a>
  );
}
