import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CtaForm } from "@/components/sections/cta-form";
import { AboutPage } from "@/components/company-pages";

export const metadata: Metadata = {
  title: "About — biogateway",
  description: "Pakistan's first biotechnology gateway — verified multiomics capacity, bioinformatics and scientist-led support.",
};

export default function Page() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <AboutPage />
        <CtaForm />
      </main>
      <Footer />
    </>
  );
}
