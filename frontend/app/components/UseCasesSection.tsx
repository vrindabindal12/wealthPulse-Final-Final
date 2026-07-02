import { useState } from 'react';
import { ArrowRight, TrendingUp, Layers, ShieldCheck } from 'lucide-react';
import useUser, { loginHref } from "@/lib/authClient";

export const UseCasesSection = () => {
  const { isSignedIn } = useUser();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const targetHref = isSignedIn ? "/Portfolio" : `${loginHref}?screen_hint=signup`;

  return (
    <section className="bg-[#F5F5F5] px-6 py-24">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column */}
        <div className="md:pr-12 md:pt-2">
          <p className="text-black/60 text-sm mb-2 font-medium tracking-wide uppercase">
            WealthPulse in Practice
          </p>
          <h2
            className="text-5xl md:text-6xl font-medium leading-none mb-6 tracking-tight text-black"
            style={{ letterSpacing: '-0.04em' }}
          >
            Core features.
          </h2>
          <p className="text-black/60 text-base leading-relaxed max-w-sm">
            WealthPulse brings institutional-grade portfolio tracking, advanced risk modeling, and conversational AI guidance straight to retail investors.
          </p>

          {/* Feature List */}
          <div className="mt-12 space-y-8">
            <div className="flex gap-4 items-start group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <TrendingUp className="w-5 h-5 text-black" />
              </div>
              <div>
                <h4 className="text-xl font-medium text-black tracking-tight mb-1">
                  Monte Carlo Forecasts
                </h4>
                <p className="text-black/60 text-sm leading-relaxed max-w-sm">
                  Run 1-year simulations to project expected price ranges, upper/lower bounds, and return probabilities.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <Layers className="w-5 h-5 text-black" />
              </div>
              <div>
                <h4 className="text-xl font-medium text-black tracking-tight mb-1">
                  Lot-Level Breakdown
                </h4>
                <p className="text-black/60 text-sm leading-relaxed max-w-sm">
                  Track individual transaction lots, buy prices, dates, and average cost metrics instead of aggregated guesswork.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <ShieldCheck className="w-5 h-5 text-black" />
              </div>
              <div>
                <h4 className="text-xl font-medium text-black tracking-tight mb-1">
                  Institutional Risk Analytics
                </h4>
                <p className="text-black/60 text-sm leading-relaxed max-w-sm">
                  Instantly compute Sharpe ratios (using a 5% risk-free rate), annualized volatility, and maximum drawdown metrics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Video Card */}
        <div className="large relative rounded-3xl overflow-hidden min-h-[720px] w-full flex flex-col justify-end bg-gradient-to-br from-[#ECECEC] via-[#F3F3F3] to-[#E5E5E5]">
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
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4"
          />

          {/* Content Overlay */}
          <div className="relative z-10 p-10 md:p-12 bg-gradient-to-t from-black/20 via-black/0 to-transparent">
            <div className="transform -translate-y-56 md:-translate-y-80">
              <h3
                className="text-4xl md:text-5xl font-medium leading-tight mb-5 text-black tracking-tight"
                style={{ letterSpacing: '-0.03em' }}
              >
                Smart Portfolio Cockpit
              </h3>

              <p className="text-black/70 text-base max-w-md mb-8 leading-relaxed">
                Monitor your Indian stocks, mutual funds, and crypto holdings under a single unified dashboard. Leverage Monte Carlo projections and chat with AI Dost to optimize your path.
              </p>

              <a
                href={targetHref}
                className="group inline-flex items-center gap-3 text-black font-medium text-base hover:text-gray-800 transition-colors duration-200"
              >
                <span className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center group-hover:bg-white transition-colors duration-200 shadow-sm">
                  <ArrowRight className="w-4 h-4 text-black" />
                </span>
                <span>Get started now</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

