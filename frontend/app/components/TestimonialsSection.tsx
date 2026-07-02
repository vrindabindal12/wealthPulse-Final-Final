import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Arjun Sharma",
    role: "Portfolio Manager, FinTech Labs",
    review: "WealthPulse completely changed how I track my personal investments. Bouncing between Binance WS for crypto and AMFI documents for Indian Mutual Funds was a nightmare. Now, it's all in a single cockpit with instant Sharpe ratio computations.",
    initials: "AS",
    rating: 5
  },
  {
    name: "Jessica Chen",
    role: "Certified Financial Planner (CFP)",
    review: "The 1-Year Monte Carlo simulations on this platform are beautiful. Showing clients realistic future return probability distributions instead of simple static projections builds massive trust. Highly recommend it.",
    initials: "JC",
    rating: 5
  },
  {
    name: "Rohan Deshmukh",
    role: "Software Engineer & Retail Investor",
    review: "AI Dost is incredible! It answers specific questions about my actual stock lot transactions in simple language, with suggestions chips and auto-scroll. The premium light theme matches my workspace perfectly.",
    initials: "RD",
    rating: 5
  },
  {
    name: "Elena Rostova",
    role: "Quantitative Analyst",
    review: "I am extremely impressed by the decoupled architecture. The background ingestion workers cache the live price feeds to Redis seamlessly, giving zero-latency portfolio valuation updates via the SSE stream.",
    initials: "ER",
    rating: 5
  },
  {
    name: "Sarah Jenkins",
    role: "Long-Term Retail Investor",
    review: "The lot-level buy transaction breakdown modal is exactly what was missing from standard trackers. I can see my average buy prices and total quantities without any math. Extremely clean UI!",
    initials: "SJ",
    rating: 5
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="bg-[#F5F5F5] py-20 border-t border-black/5 overflow-hidden">
      <div className="max-w-[88rem] mx-auto px-6 mb-12">
        <p className="text-black/60 text-sm mb-2 font-medium tracking-wide uppercase text-center">
          Investor Feedback
        </p>
        <h2
          className="text-4xl md:text-5xl font-medium text-center tracking-tight text-black"
          style={{ letterSpacing: '-0.03em' }}
        >
          Loved by retail investors.
        </h2>
      </div>

      {/* Infinite Scroll Marquee */}
      <div className="relative w-full overflow-hidden py-4 flex flex-col items-center">
        {/* Fade gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#F5F5F5] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#F5F5F5] to-transparent z-10 pointer-events-none" />

        <div className="testimonials-track flex gap-6">
          {/* First loop */}
          {testimonials.map((t, idx) => (
            <div
              key={`testimonial-1-${idx}`}
              className="w-[450px] bg-white border border-black/5 rounded-[1.5rem] p-8 shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:border-black/15 transition-all duration-300 select-none shrink-0"
            >
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-black/80 text-base leading-relaxed mb-6 font-normal">
                  &ldquo;{t.review}&rdquo;
                </p>
              </div>
              
              <div className="flex items-center gap-4 border-t border-black/5 pt-4">
                <div className="w-10 h-10 rounded-full bg-black/5 border border-black/5 flex items-center justify-center text-black font-bold text-sm shrink-0">
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-black leading-tight">
                    {t.name}
                  </h4>
                  <p className="text-xs text-black/50">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Second loop (for infinite scrolling) */}
          {testimonials.map((t, idx) => (
            <div
              key={`testimonial-2-${idx}`}
              className="w-[450px] bg-white border border-black/5 rounded-[1.5rem] p-8 shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:border-black/15 transition-all duration-300 select-none shrink-0"
            >
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-black/80 text-base leading-relaxed mb-6 font-normal">
                  &ldquo;{t.review}&rdquo;
                </p>
              </div>
              
              <div className="flex items-center gap-4 border-t border-black/5 pt-4">
                <div className="w-10 h-10 rounded-full bg-black/5 border border-black/5 flex items-center justify-center text-black font-bold text-sm shrink-0">
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-black leading-tight">
                    {t.name}
                  </h4>
                  <p className="text-xs text-black/50">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
