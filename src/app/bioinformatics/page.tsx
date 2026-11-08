import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CtaForm } from "@/components/sections/cta-form";
import { ServiceDetail } from "@/components/service-detail";
import { getBioPage } from "@/lib/bioinformatics-pages";

const overview = getBioPage("overview")!;

export const metadata: Metadata = {
  title: `${overview.title} — biogateway`,
  description: overview.tagline,
};

export default function BioinformaticsPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <ServiceDetail s={overview} />
        <CtaForm />
      </main>
      <Footer />
    </>
  );
}
