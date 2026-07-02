"use client";

import { HeroSection } from "./Hero";
import { BackedBySection } from "./BackedBySection";
import { InfoSection } from "./InfoSection";
import { UseCasesSection } from "./UseCasesSection";
import { TestimonialsSection } from "./TestimonialsSection";
import Footer from "./Footer";


export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#F5F5F5] text-black overflow-x-hidden flex flex-col">
      <HeroSection />
      <InfoSection />
      <BackedBySection />
      <UseCasesSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}

