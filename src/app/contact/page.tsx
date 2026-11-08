import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CtaForm } from "@/components/sections/cta-form";
import { ContactPage } from "@/components/contact-page";

export const metadata: Metadata = {
  title: "Contact — biogateway",
  description: "Reach the Pakistan Biotechnology Gateway team — quotes, partnerships and scientific consultation.",
};

export default function Page() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <ContactPage />
        <CtaForm />
      </main>
      <Footer />
    </>
  );
}
