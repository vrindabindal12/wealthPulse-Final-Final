"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useUser, { loginHref } from "@/lib/authClient";
import { FuturisticBackground } from "./FuturisticBackground";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const mockRef = useRef(null);
  const portalRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      // Initial state
      gsap.set(mockRef.current, { scale: 3, opacity: 0, z: -1000 });
      gsap.set(portalRef.current, { scale: 0.5, opacity: 0 });

      tl.to(portalRef.current, { scale: 1.5, opacity: 1, duration: 2, ease: "power4.inOut" })
        .to(mockRef.current, { scale: 1, opacity: 1, z: 0, duration: 2.5, ease: "expo.out" }, "-=1.5")
        .from(".char", {
          y: 100,
          opacity: 0,
          stagger: 0.02,
          duration: 1,
          ease: "back.out(1.7)"
        }, "-=2")
        .from(subtitleRef.current, { y: 20, opacity: 0, duration: 1 }, "-=1.5")
        .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.8 }, "-=1.2");

      // Scroll Perspective
      gsap.to(mockRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        },
        rotateX: 45,
        y: -200,
        scale: 0.8,
        opacity: 0.5
      });

      // Ambient Portal Pulse
      gsap.to(portalRef.current, {
        scale: 1.6,
        opacity: 0.8,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const title = "SYSTEMS FROM THE FUTURE.";
  const chars = title.split("");

  return (
    <section 
      ref={heroRef}
      className="relative w-full min-h-screen pt-40 pb-20 overflow-hidden flex flex-col items-center justify-center text-white bg-black perspective-1000"
    >
      <FuturisticBackground />
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 scanlines opacity-30 z-50 pointer-events-none" />
      <div className="absolute inset-0 noise opacity-10 z-50 pointer-events-none" />

      {/* The Portal (Bloom Effect) */}
      <div 
        ref={portalRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none z-0" 
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-7xl">
        <div ref={titleRef} className="mb-8">
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none flex flex-wrap justify-center overflow-hidden">
            {chars.map((char, i) => (
              <span key={i} className="char inline-block whitespace-pre">
                {char}
              </span>
            ))}
          </h1>
        </div>

        <div ref={subtitleRef} className="max-w-2xl">
          <p className="text-xl md:text-2xl text-gray-400 font-light tracking-[0.2em] mb-12 uppercase italic">
            Experience the next era of decentralized intelligence.
          </p>
        </div>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-8">
          {(() => {
            const { isSignedIn } = useUser();
            const link = isSignedIn ? "/Portfolio" : `${loginHref}?screen_hint=signup`;
            return (
              <>
                <a 
                  href={link} 
                  className="group relative px-12 py-5 bg-transparent border border-white/20 text-white font-black text-xl rounded-none overflow-hidden transition-all duration-500 hover:border-purple-500"
                >
                  <span className="relative z-10 group-hover:text-black transition-colors duration-500 uppercase tracking-[0.3em]">Ignite Core</span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-expo" />
                </a>
                <a 
                  href="#features" 
                  className="px-12 py-5 text-gray-500 font-bold text-xl hover:text-white transition-colors uppercase tracking-[0.3em] flex items-center gap-4 group"
                >
                  Analyze Systems <span className="group-hover:translate-x-4 transition-transform duration-500">{" >>"}</span>
                </a>
              </>
            );
          })()}
        </div>
      </div>

      {/* Hero Product Visual with 3D Depth */}
      <div 
        ref={mockRef}
        className="relative z-20 mt-32 w-full max-w-6xl px-6 preserve-3d"
      >
        <div className="relative group p-1 transition-all duration-700">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 rounded-[2.5rem] blur-3xl opacity-20 group-hover:opacity-60 animate-pulse" />
          
          <div className="relative rounded-[2rem] border border-white/10 bg-black/80 backdrop-blur-3xl overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.2)]">
            <img 
              src="/dashboard-mock.png" 
              alt="Future System Interface" 
              className="w-full h-auto object-cover opacity-90 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100"
            />
          </div>
        </div>
      </div>
    </section>
  );
}



