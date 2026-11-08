import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const helixa = Inter({
  variable: "--font-helixa",
  subsets: ["latin"],
});

const luxora = Space_Grotesk({
  variable: "--font-luxora",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pakistan Biotechnology Gateway — Sequencing, Bioinformatics & Supply Marketplace",
  description:
    "A federated digital marketplace connecting researchers, universities, hospitals and industry with verified sequencing labs, bioinformatics providers and indigenous biotech suppliers across Pakistan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html suppressHydrationWarning
      lang="en"
      className={`${helixa.variable} ${luxora.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
