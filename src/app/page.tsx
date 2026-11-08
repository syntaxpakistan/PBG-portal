import { AnnouncementBar } from "@/components/announcement-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/sections/hero";
import { LogoStrip } from "@/components/sections/logo-strip";
import { FeaturedServices } from "@/components/sections/featured-services";
import { VerifiedBanner } from "@/components/sections/verified-banner";
import { WhoWeAre } from "@/components/sections/who-we-are";
import { FourWays } from "@/components/sections/four-ways";
import { NewsInsights } from "@/components/sections/news-insights";
import { Enterprise } from "@/components/sections/enterprise";
import { CtaForm } from "@/components/sections/cta-form";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <LogoStrip />
        <FeaturedServices />
        <VerifiedBanner />
        <FourWays />
        <WhoWeAre />
        <NewsInsights />
        <Enterprise />
        <CtaForm />
      </main>
      <Footer />
    </>
  );
}
