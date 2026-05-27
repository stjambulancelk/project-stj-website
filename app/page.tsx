import HeroSection from "@/components/sections/HeroSection";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import ServicesGrid from "@/components/sections/ServicesGrid";
import StatsBar from "@/components/sections/StatsBar";
import EmergencyCTA from "@/components/sections/EmergencyCTA";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyChooseUs />
      <ServicesGrid />
      <StatsBar />
      <EmergencyCTA />
    </>
  );
}
