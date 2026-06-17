import { ArrowRight } from 'lucide-react';

export const UseCasesSection = () => {
  return (
    <section className="bg-[#F5F5F5] px-6 py-24">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column */}
        <div className="md:pr-12 md:pt-2">
          <p className="text-black/60 text-sm mb-2 font-medium tracking-wide uppercase">
            USD Halo in Practice
          </p>
          <h2 
            className="text-5xl md:text-6xl font-medium leading-none mb-6 tracking-tight text-black"
            style={{ letterSpacing: '-0.04em' }}
          >
            Use modes
          </h2>
          <p className="text-black/60 text-base leading-relaxed max-w-sm">
            USD Halo powers a wide range of modes for builders, companies and treasuries wanting safe and rewarding stablecoin integrations plus more.
          </p>
        </div>

        {/* Right Column Video Card */}
        <div className="large relative rounded-3xl overflow-hidden min-h-[720px] w-full flex flex-col justify-end">
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="object-cover absolute inset-0 w-full h-full"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4"
          />

          {/* Content Overlay */}
          <div className="relative z-10 p-10 md:p-12 bg-gradient-to-t from-black/20 via-black/0 to-transparent">
            <h3 
              className="text-4xl md:text-5xl font-medium leading-tight mb-5 text-black tracking-tight"
              style={{ letterSpacing: '-0.03em' }}
            >
              Commerce
            </h3>
            
            <p className="text-black/70 text-base max-w-md mb-8 leading-relaxed">
              Lift customer retention by offering USD Halo, a trusted dollar-backed stablecoin with strong yields, letting your patrons earn with zero effort on your platform.
            </p>

            <a 
              href="#know-more" 
              className="group inline-flex items-center gap-3 text-black font-medium text-base hover:text-gray-800 transition-colors duration-200"
            >
              <span className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center group-hover:bg-white transition-colors duration-200 shadow-sm">
                <ArrowRight className="w-4 h-4 text-black" />
              </span>
              <span>Know more</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
