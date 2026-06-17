"use client";

import Navbar from "./Navbar";
import { HeroSection } from "./Hero";
import { InfoSection } from "./InfoSection";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#F5F5F5] text-black overflow-x-hidden flex flex-col">
      <Navbar />
      <HeroSection />
      <InfoSection />
      <Footer />
    </div>
  );
}

