"use client";

import { ArrowRight } from 'lucide-react';

const heroBrands = [
  { name: 'Stripe', style: { fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px' } },
  { name: 'Coinbase', style: { fontFamily: 'Arial, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '13px', textTransform: 'uppercase' } },
  { name: 'Uniswap', style: { fontFamily: '"Trebuchet MS", sans-serif', fontWeight: 600, letterSpacing: '0.01em', fontSize: '15px', fontStyle: 'italic' } },
  { name: 'Aave', style: { fontFamily: '"Courier New", monospace', fontWeight: 700, letterSpacing: '0.12em', fontSize: '13px', textTransform: 'uppercase' } },
  { name: 'Compound', style: { fontFamily: 'Palatino, "Book Antiqua", serif', fontWeight: 400, letterSpacing: '-0.01em', fontSize: '16px' } },
  { name: 'MakerDAO', style: { fontFamily: 'Impact, "Arial Narrow", sans-serif', fontWeight: 400, letterSpacing: '0.04em', fontSize: '14px' } },
  { name: 'Chainlink', style: { fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '13px' } },
];

export const HeroSection = () => {
  return (
    <section className="flex-1 px-6 pt-20 pb-6 flex items-end">
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ height: 'calc(100vh - 96px)' }}
      >
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="object-cover absolute inset-0 w-full h-full"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4"
        />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-start justify-start h-full p-6 md:p-12 pt-20 md:pt-36 hero-overlay">
          <h1
            className="text-black text-5xl md:text-6xl font-medium leading-tight max-w-xl mb-4 tracking-tight"
            style={{ letterSpacing: '-0.04em' }}
          >
            Your Wealth<br />Works
          </h1>

          <p
            className="text-black/70 text-base md:text-lg max-w-md mb-8 leading-relaxed font-sans hero-p"
            style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
          >
            An automated, reward-powered digital dollar built for native passive earnings and effortless connection into DeFi.
          </p>

          <button className="inline-flex items-center gap-3 bg-black text-white text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
            <span>Join us</span>
            <span className="bg-white rounded-full p-2 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-black" />
            </span>
          </button>

          {/* Brand Marquee */}
          <div className="mt-12 md:mt-24 w-full max-w-md overflow-hidden hero-marquee-container">
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
