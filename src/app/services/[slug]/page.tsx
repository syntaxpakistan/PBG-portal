import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CtaForm } from "@/components/sections/cta-form";
import { ServiceDetail } from "@/components/service-detail";
import { SERVICE_PAGES, getServicePage } from "@/lib/service-pages";

export function generateStaticParams() {
  return SERVICE_PAGES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getServicePage(slug);
  return s ? { title: `${s.title} — biogateway`, description: s.tagline } : {};
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServicePage(slug);
  if (!service) notFound();

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <ServiceDetail s={service} />
        <CtaForm />
      </main>
      <Footer />
    </>
  );
}
