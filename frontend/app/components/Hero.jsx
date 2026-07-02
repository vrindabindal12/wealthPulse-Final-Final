"use client";

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import useUser, { loginHref } from "@/lib/authClient";

const heroBrands = [
  { name: 'Nifty 50', style: { fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px' } },
  { name: 'Sensex', style: { fontFamily: 'Arial, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '13px', textTransform: 'uppercase' } },
  { name: 'Nasdaq', style: { fontFamily: '"Trebuchet MS", sans-serif', fontWeight: 600, letterSpacing: '0.01em', fontSize: '15px', fontStyle: 'italic' } },
  { name: 'Bitcoin', style: { fontFamily: '"Courier New", monospace', fontWeight: 700, letterSpacing: '0.12em', fontSize: '13px', textTransform: 'uppercase' } },
  { name: 'Mutual Funds', style: { fontFamily: 'Palatino, "Book Antiqua", serif', fontWeight: 400, letterSpacing: '-0.01em', fontSize: '16px' } },
  { name: 'Gold', style: { fontFamily: 'Impact, "Arial Narrow", sans-serif', fontWeight: 400, letterSpacing: '0.04em', fontSize: '14px' } },
  { name: 'S&P 500', style: { fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '13px' } },
];

export const HeroSection = () => {
  const { isSignedIn } = useUser();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const targetHref = isSignedIn ? "/Portfolio" : `${loginHref}?screen_hint=signup`;

  return (
    <section className="flex-1 px-6 pt-16 md:pt-20 pb-4 md:pb-6 flex items-end">
      <div
        className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#ECECEC] via-[#F3F3F3] to-[#E5E5E5]"
        style={{ height: 'calc(100vh - 140px)', minHeight: '480px' }}
      >
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          className={`object-cover absolute inset-0 w-full h-full transition-opacity duration-1000 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4"
        />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-start justify-between h-full px-6 md:px-12 pt-8 md:pt-12 pb-6 md:pb-8 hero-overlay">
          <div className="flex flex-col items-start">
            <h1
              className="text-black text-5xl md:text-6xl font-medium leading-tight max-w-xl mb-4 tracking-tight"
              style={{ letterSpacing: '-0.04em' }}
            >
              The Pulse of<br /> <i>Your Wealth</i>
            </h1>

            <p
              className="text-black/70 text-base md:text-lg max-w-md mb-4 md:mb-6 leading-relaxed font-sans hero-p"
              style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
            >
              An AI-powered portfolio cockpit for retail investors. Track stocks, mutual funds, and crypto in one place with real-time risk/return analytics and smart AI guidance.
            </p>

            <Link
              href={targetHref}
              className="inline-flex items-center gap-3 bg-black text-white text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
            >
              <span>Get started</span>
              <span className="bg-white rounded-full p-2 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-black" />
              </span>
            </Link>
          </div>

          {/* Brand Marquee */}
          <div className="mt-4 md:mt-6 w-full max-w-md overflow-hidden hero-marquee-container">
            <div className="marquee-track">
              {/* First iteration */}
              {heroBrands.map((brand, idx) => (
                <span
                  key={`hero-brand-1-${idx}`}
                  className="mx-7 shrink-0 text-black/60 whitespace-nowrap"
                  style={brand.style}
                >
                  {brand.name}
                </span>
              ))}
              {/* Second iteration */}
              {heroBrands.map((brand, idx) => (
                <span
                  key={`hero-brand-2-${idx}`}
                  className="mx-7 shrink-0 text-black/60 whitespace-nowrap"
                  style={brand.style}
                >
                  {brand.name}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
