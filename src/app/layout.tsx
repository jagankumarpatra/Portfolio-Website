import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { OverlayProvider } from "@/context/OverlayContext";
import ThemeShell from "@/components/ThemeShell";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingAIButton from "@/components/FloatingAIButton";
import AIOverlay from "@/components/AIOverlay";
import { getQA, getSite } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import SearchOverlay from "@/components/SearchOverlay";
import { getSearchItems } from "@/lib/portfolio";

const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});
const jetbrains = localFont({
  src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: "100 800",
});

const site = getSite();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.homeTitle, template: `%s | ${site.name} — Backend Engineer` },
  description: site.metaDescription,
  openGraph: { type: "website", siteName: site.name, title: site.homeTitle, description: site.metaDescription },
  twitter: { card: "summary_large_image", title: site.homeTitle, description: site.metaDescription },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#F5F2EA" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const entries = getQA();
  const searchItems = getSearchItems();
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <a href="#main" className="skip-link">Skip to content</a>
        <OverlayProvider>
          <ThemeShell>
            <Header name={site.name} tagline={site.headline} github={site.github} searchItems={searchItems} />
            <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 outline-none md:px-8 md:py-12">
              {children}
            </main>
            <Footer />
            <SearchOverlay items={searchItems} />
            <FloatingAIButton hideOnHome />
            <AIOverlay entries={entries} fallback={site.aiFallback} welcome={site.aiWelcome} />
          </ThemeShell>
        </OverlayProvider>
        <Analytics />
      </body>
    </html>
  );
}
