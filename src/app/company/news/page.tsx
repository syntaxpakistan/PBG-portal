import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CtaForm } from "@/components/sections/cta-form";
import { NewsPage } from "@/components/company-news";

export const metadata: Metadata = {
  title: "News & Events — biogateway",
  description: "Conferences, webinars and announcements from the Pakistan Biotechnology Gateway.",
};

export default function Page() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <NewsPage />
        <CtaForm />
      </main>
      <Footer />
    </>
  );
}
