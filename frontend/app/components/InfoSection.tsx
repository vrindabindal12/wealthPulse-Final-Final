"use client";

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import useUser, { loginHref } from "@/lib/authClient";

export const InfoSection = () => {
  const { isSignedIn } = useUser();
  const targetHref = isSignedIn ? "/Portfolio" : `${loginHref}?screen_hint=signup`;
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className="bg-[#F5F5F5] px-6 py-24" id="features">
      <div className="max-w-[88rem] mx-auto">
        {/* Row 1: Intro Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
          <div>
            <h2
              className="text-black text-4xl md:text-5xl font-medium leading-tight mb-8 tracking-tight"
              style={{ letterSpacing: '-0.03em' }}
            >
              Meet WealthPulse.
            </h2>
            <Link
              href={targetHref}
              className="inline-flex items-center gap-3 bg-black text-white text-base font-medium pl-6 pr-1.5 py-1.5 rounded-full hover:bg-gray-800 transition-colors duration-200"
            >
              <span>Explore dashboard</span>
              <span className="bg-white rounded-full p-1.5 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-black" />
              </span>
            </Link>
          </div>
          <div>
            <p className="text-black/70 text-2xl md:text-3xl leading-relaxed">
              WealthPulse is an AI-powered portfolio cockpit that gives you institutional-grade analytics, risk assessments, and conversational guidance.
            </p>
          </div>
        </div>

        {/* Row 2: Card Grid/Flex Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-4 w-full">

          {/* Card 1: Unified Tracking */}
          <div
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            className="rounded-2xl p-7 min-h-80 flex flex-col justify-between relative overflow-hidden"
            style={{
              backgroundImage: `url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260423_164207_f243351d-ed59-48ec-83a0-a5e996bdbe3c.png&w=1280&q=85')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexGrow: hoveredCard === 2 || hoveredCard === 3 ? 1 : 2,
              flexShrink: 1,
              flexBasis: '0%',
              willChange: 'flex-grow',
              transition: 'flex-grow 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <h3
              className="text-black text-2xl font-medium leading-snug tracking-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              Unified tracking
            </h3>
            <p className="text-black/70 text-base max-w-xs">
              Consolidate your Indian stocks, mutual funds, and crypto holdings in one single screen.
            </p>
          </div>

          {/* Card 2: Deep Risk Analytics */}
          <div
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
            className="rounded-2xl p-7 min-h-80 flex flex-col justify-between relative overflow-hidden"
            style={{
              backgroundColor: hoveredCard === 2 ? '#F3F0FA' : '#2B2644',
              flexGrow: hoveredCard === 2 ? 2 : 1,
              flexShrink: 1,
              flexBasis: '0%',
              willChange: 'flex-grow, background-color',
              transition: 'flex-grow 1.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.7s ease-in-out'
            }}
          >
            {/* Hover Background Image overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out pointer-events-none"
              style={{
                backgroundImage: `url('/risk_bg_light.png')`,
                opacity: hoveredCard === 2 ? 1.0 : 0,
              }}
            />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <h3
                className={`text-2xl font-medium leading-snug tracking-tight transition-colors duration-700 ease-in-out ${hoveredCard === 2 ? 'text-black' : 'text-white'
                  }`}
                style={{ letterSpacing: '-0.02em' }}
              >
                Deep risk{"\n"}analytics.
              </h3>
              <p
                className={`text-base transition-colors duration-700 ease-in-out ${hoveredCard === 2 ? 'text-black/70' : 'text-white/60'
                  }`}
              >
                Monitor Volatility, Sharpe ratio, and 1-year Monte Carlo simulations dynamically.
              </p>
            </div>
          </div>

          {/* Card 3: AI-Powered Guidance */}
          <div
            onMouseEnter={() => setHoveredCard(3)}
            onMouseLeave={() => setHoveredCard(null)}
            className="rounded-2xl p-7 min-h-80 flex flex-col justify-between relative overflow-hidden"
            style={{
              backgroundColor: hoveredCard === 3 ? '#F3F0FA' : '#2B2644',
              flexGrow: hoveredCard === 3 ? 2 : 1,
              flexShrink: 1,
              flexBasis: '0%',
              willChange: 'flex-grow, background-color',
              transition: 'flex-grow 1.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.7s ease-in-out'
            }}
          >
            {/* Hover Background Image overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out pointer-events-none"
              style={{
                backgroundImage: `url('/ai_bg_light.png')`,
                opacity: hoveredCard === 3 ? 1.0 : 0,
              }}
            />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <h3
                className={`text-2xl font-medium leading-snug tracking-tight transition-colors duration-700 ease-in-out ${hoveredCard === 3 ? 'text-black' : 'text-white'
                  }`}
                style={{ letterSpacing: '-0.02em' }}
              >
                AI-powered{"\n"}guidance
              </h3>
              <p
                className={`text-base transition-colors duration-700 ease-in-out ${hoveredCard === 3 ? 'text-black/70' : 'text-white/60'
                  }`}
              >
                Get insights from AI Dost and download custom portfolio reports automatically.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
