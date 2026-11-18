import type { Metadata } from "next";
import { Fraunces, Inter, Noto_Sans_Devanagari } from "next/font/google";
import { Providers } from "@/components/Providers";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

// Serif for headings, Inter for body; Noto Sans Devanagari covers Hindi text.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Swasth — Public Health Awareness Chatbot",
    template: "%s | Swasth",
  },
  description:
    "Trusted, source-cited public health awareness for India: diseases, prevention, vaccination and government programmes. Educational only, not medical advice.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${fraunces.variable} ${inter.variable} ${devanagari.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <I18nProvider initialLocale={locale}>{children}</I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
