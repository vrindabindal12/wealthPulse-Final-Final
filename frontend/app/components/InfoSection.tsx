import { ArrowRight } from 'lucide-react';

export const InfoSection = () => {
  return (
    <section className="bg-[#F5F5F5] px-6 py-24">
      <div className="max-w-[88rem] mx-auto">
        {/* Row 1: Intro Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
          <div>
            <h2 
              className="text-black text-4xl md:text-5xl font-medium leading-tight mb-8 tracking-tight"
              style={{ letterSpacing: '-0.03em' }}
            >
              Meet USD Halo.
            </h2>
            <button className="inline-flex items-center gap-3 bg-black text-white text-base font-medium pl-6 pr-1.5 py-1.5 rounded-full hover:bg-gray-800 transition-colors duration-200">
              <span>Discover it</span>
              <span className="bg-white rounded-full p-1.5 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-black" />
              </span>
            </button>
          </div>
          <div>
            <p className="text-black/70 text-2xl md:text-3xl leading-relaxed">
              USD Halo is a reward-earning dollar coin that lets your savings grow while remaining tied to the U.S. dollar.
            </p>
          </div>
        </div>

        {/* Row 2: 4-Column Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Savings that bloom (Spans 2 columns on lg) */}
          <div 
            className="rounded-2xl p-7 min-h-80 flex flex-col justify-between lg:col-span-2 relative overflow-hidden"
            style={{
              backgroundImage: `url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260423_164207_f243351d-ed59-48ec-83a0-a5e996bdbe3c.png&w=1280&q=85')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <h3 
              className="text-black text-2xl font-medium leading-snug tracking-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              Savings that bloom
            </h3>
            <p className="text-black/70 text-base max-w-xs">
              Gain steady returns as your dollar tokens are routed into top-performing DeFi strategies.
            </p>
          </div>

          {/* Card 2: Always fluid, always pegged */}
          <div className="bg-[#2B2644] rounded-2xl p-7 min-h-80 flex flex-col justify-between">
            <h3 className="text-white text-2xl font-medium leading-snug whitespace-pre-line tracking-tight">
              Always fluid,{"\n"}always pegged.
            </h3>
            <p className="text-white/60 text-base">
              Keep fully dollar-anchored with on-demand access to funds — no lockups or waits.
            </p>
          </div>

          {/* Card 3: Fully automated */}
          <div className="bg-[#2B2644] rounded-2xl p-7 min-h-80 flex flex-col justify-between">
            <h3 className="text-white text-2xl font-medium leading-snug whitespace-pre-line tracking-tight">
              Fully{"\n"}automated
            </h3>
            <p className="text-white/60 text-base">
              Skip the task of tuning positions yourself. USD Halo runs in the background for you.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
