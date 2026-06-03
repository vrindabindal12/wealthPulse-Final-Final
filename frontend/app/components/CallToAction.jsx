"use client";
import useUser, { loginHref } from "@/lib/authClient";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";

export const CallToAction = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(textRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative py-72 overflow-hidden bg-black"
    >
      {/* The Singularity (Massive Bloom) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/10 blur-[180px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1 px] h-[1000px] bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div 
          ref={textRef}
          className="max-w-6xl mx-auto text-center"
        >
          <div className="inline-block px-6 py-2 border border-purple-500/30 bg-purple-500/5 text-purple-400 font-mono text-[10px] tracking-[0.5em] uppercase mb-12">
            System Synchronized
          </div>

          <h2 className="text-6xl md:text-[10rem] font-black tracking-tighter uppercase italic leading-[0.8] mb-16 text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20">
            ENTER THE <br />
            <span className="text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">SINGULARITY.</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-400 font-light tracking-[0.3em] mb-20 max-w-4xl mx-auto uppercase italic">
            Your final portal to institutional-grade wealth intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
            {(() => {
              const { isSignedIn } = useUser();
              const link = isSignedIn ? "/Portfolio" : `${loginHref}?screen_hint=signup`;
              return (
                <>
                  <a 
                    href={link} 
                    className="group relative px-20 py-8 bg-white text-black font-black text-2xl rounded-none transition-all duration-700 hover:scale-110 shadow-[0_0_100px_rgba(255,255,255,0.15)]"
                  >
                    <span className="relative z-10 tracking-[0.2em] uppercase">Initialize</span>
                    <div className="absolute inset-0 bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" />
                  </a>
                  <a 
                    href="/Courses"
                    className="text-gray-500 font-bold text-lg hover:text-white transition-all tracking-[0.4em] uppercase group"
                  >
                    Read Docs 
                    <span className="inline-block translate-x-0 group-hover:translate-x-4 transition-transform duration-500 ml-4">{" >>"}</span>
                  </a>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
};



