import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CtaForm } from "@/components/sections/cta-form";
import { ServiceDetail } from "@/components/service-detail";
import { BIO_PAGES, getBioPage } from "@/lib/bioinformatics-pages";

export function generateStaticParams() {
  return BIO_PAGES.filter((s) => s.slug !== "overview").map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getBioPage(slug);
  return s && slug !== "overview" ? { title: `${s.title} — biogateway`, description: s.tagline } : {};
}

export default async function BioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getBioPage(slug);
  if (!page || slug === "overview") notFound();

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <ServiceDetail s={page} />
        <CtaForm />
      </main>
      <Footer />
    </>
  );
}
