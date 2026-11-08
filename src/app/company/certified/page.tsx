import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CtaForm } from "@/components/sections/cta-form";
import { CertifiedPage } from "@/components/company-pages";

export const metadata: Metadata = {
  title: "Certified Service Provider — biogateway",
  description: "Gateway providers validated for 10x Genomics, Illumina, Olink, PacBio and Twist Bioscience workflows.",
};

export default function Page() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <CertifiedPage />
        <CtaForm />
      </main>
      <Footer />
    </>
  );
}
