import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PartnersPage } from "@/components/partners-page";

export const metadata: Metadata = {
  title: "Partners — biogateway",
  description:
    "Verified institutional partners of the Pakistan Biotechnology Gateway — CAS-NGS at the University of Agriculture Faisalabad and Genexa Analytics bioinformatics services.",
};

export default function Page() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <PartnersPage />
      </main>
      <Footer />
    </>
  );
}
