import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CtaForm } from "@/components/sections/cta-form";
import { CareersPage } from "@/components/company-pages";

export const metadata: Metadata = {
  title: "Careers — biogateway",
  description: "Join a scientist-led team building the future of multiomics in Pakistan.",
};

export default function Page() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <CareersPage />
        <CtaForm />
      </main>
      <Footer />
    </>
  );
}
