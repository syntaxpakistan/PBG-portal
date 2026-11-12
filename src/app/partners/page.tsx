export const instant = false

import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PartnersPage } from "@/components/partners-page";

export const metadata: Metadata = {
  title: "Verified Biotech Lab Partners — Pakistan Biotechnology Gateway",
  description:
    "Verified institutional partners of the Pakistan Biotechnology Gateway — CAS-NGS at the University of Agriculture Faisalabad and Genexa Analytics bioinformatics services.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-paper">
      <Navbar />
      <PartnersPage />
      <Footer />
    </main>
  );
}
