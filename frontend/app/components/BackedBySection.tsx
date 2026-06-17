const backersBrands = [
  { name: 'Fundamental Labs', style: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 400, letterSpacing: '0.02em', fontSize: '14px' } },
  { name: 'KUCOIN', style: { fontFamily: '"Arial Black", Gadget, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '16px' } },
  { name: 'NGC', style: { fontFamily: 'Impact, Charcoal, sans-serif', fontWeight: 700, letterSpacing: '0.05em', fontSize: '18px' } },
  { name: 'NxGen', style: { fontFamily: 'Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', fontSize: '17px' } },
  { name: 'Matter Labs', style: { fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: '15px' } },
  { name: 'DEXTools', style: { fontFamily: 'Verdana, Geneva, sans-serif', fontWeight: 700, letterSpacing: '0.06em', fontSize: '14px', textTransform: 'uppercase' as const } },
  { name: 'NGRAVE', style: { fontFamily: '"Courier New", Courier, monospace', fontWeight: 700, letterSpacing: '0.18em', fontSize: '14px' } },
  { name: 'Polychain', style: { fontFamily: 'Palatino, "Book Antiqua", Palatino Linotype, serif', fontWeight: 500, letterSpacing: '0.03em', fontSize: '15px' } },
];

export const BackedBySection = () => {
  return (
    <section className="bg-[#F5F5F5] px-6 py-12">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-center border-t border-b border-black/5 py-12">
        {/* Left Description (1/4) */}
        <div className="md:col-span-1">
          <p className="text-black/70 text-base leading-relaxed whitespace-pre-line">
            Funded by premier partners{"\n"}and forward-thinking leaders.
          </p>
        </div>

        {/* Right Sponsor Marquee (3/4) */}
        <div className="md:col-span-3 overflow-hidden">
          <div className="backers-track">
            {/* First iteration */}
            {backersBrands.map((brand, idx) => (
              <span
                key={`backer-brand-1-${idx}`}
                className="mx-10 shrink-0 text-black/50 whitespace-nowrap"
                style={brand.style}
              >
                {brand.name}
              </span>
            ))}
            {/* Second iteration */}
            {backersBrands.map((brand, idx) => (
              <span
                key={`backer-brand-2-${idx}`}
                className="mx-10 shrink-0 text-black/50 whitespace-nowrap"
                style={brand.style}
              >
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
