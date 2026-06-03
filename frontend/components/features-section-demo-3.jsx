"use client";

import React from "react";
import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturesSectionDemo() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out"
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const features = [
    {
      title: "Consolidated Asset Intelligence",
      description:
        "Unified visibility across equities, fixed income, crypto, and mutual funds. Normalized data streams for crystal-clear portfolio oversight.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r border-white/5",
    },
    {
      title: "Predictive Risk Modeling",
      description:
        "Utilize advanced AI to simulate market volatility and optimize your asset allocation based on real-time risk parameters.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 border-white/5",
    },
    {
      title: "Institutional Knowledge Base",
      description:
        "Access curated financial intelligence and structured learning modules to master complex market instruments.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r border-white/5 lg:pb-6",
    },
    {
      title: "Global Liquidity Network",
      description:
        "Connect to global markets with low-latency data feeds and secure transaction protocols designed for serious investors.",
      skeleton: <SkeletonFour />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r border-white/5 lg:pb-12",
    },
  ];

  return (
    <section ref={sectionRef} id="features" className="relative w-full py-48 bg-black overflow-hidden text-white">
      <div className="relative z-20 max-w-7xl mx-auto px-6">
        <div className="mb-32 text-center">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic mb-8">
            QUANTUM <span className="text-purple-500 shadow-purple-500/50 shadow-2xl">CORE</span>
          </h2>
          <p className="text-gray-500 text-xl font-light tracking-[0.4em] uppercase">
            Hyper-threaded market processing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              ref={el => cardsRef.current[index] = el}
              className={cn(`glass p-12 relative group rounded-none overflow-hidden`, feature.className)}
            >
              <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-white/20 tracking-widest border-l border-b border-white/5">
                SEC_TYPE_0{index + 1}
              </div>

              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="mt-16 relative">
                <div className="absolute inset-0 bg-purple-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                {feature.skeleton}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


const FeatureCard = ({ children, className }) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }) => {
  return (
    <p className="max-w-5xl mx-auto text-left tracking-tight text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-white",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

// --- Skeletons (visuals unchanged, themed appropriately) ---

export const SkeletonOne = () => {
  return (
    <div className="relative flex items-center justify-center py-6 px-3 h-72">
      <div className="w-full mx-auto bg-white dark:bg-neutral-900 shadow-xl rounded-lg overflow-hidden">
        <img
          src="/ss.png"
          alt="portfolio tracking"
          width={600}
          height={600}
          className="h-72 w-full object-cover object-center rounded-md"
        />
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-24 bg-gradient-to-t from-[#0b0b12] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-24 bg-gradient-to-b from-[#0b0b12] via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

export const SkeletonTwo = () => {
  const charts = [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71", // Charts/analytics
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f", // Graphs
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3", // Data visualization
    "https://images.unsplash.com/photo-1563986768609-322da13575f3", // Business charts
  ];


  const imageVariants = {
    whileHover: { scale: 1.05, zIndex: 50 },
    whileTap: { scale: 1.05, zIndex: 50 },
  };

  return (
    <div className="relative flex flex-col items-center justify-center gap-3 py-4 h-72 overflow-hidden">
      <div className="flex flex-row justify-center gap-3">
        {charts.slice(0, 2).map((image, idx) => (
          <motion.div
            key={`chart1-${idx}`}
            variants={imageVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-md overflow-hidden border border-neutral-800 bg-neutral-900"
          >
            <img
              src={image}
              alt="investment chart"
              className="h-28 w-28 md:h-32 md:w-32 object-cover"
            />
          </motion.div>
        ))}
      </div>
      <div className="flex flex-row justify-center gap-3">
        {charts.slice(2, 4).map((image, idx) => (
          <motion.div
            key={`chart2-${idx}`}
            variants={imageVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-md overflow-hidden border border-neutral-800 bg-neutral-900"
          >
            <img
              src={image}
              alt="AI investment insight"
              className="h-28 w-28 md:h-32 md:w-32 object-cover"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <div className="flex justify-center items-center mt-6">
      <div className="relative w-[300px] h-[300px] bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl p-4 flex flex-col justify-between">
        <div className="flex flex-col gap-2 text-sm text-white overflow-hidden">
          <div className="self-start bg-white/20 px-3 py-2 rounded-lg rounded-bl-none max-w-[80%]">
            What’s a mutual fund?
          </div>
          <div className="self-end bg-purple-600/80 px-3 py-2 rounded-lg rounded-br-none max-w-[80%]">
            A mutual fund pools money from investors to invest in diversified assets.
          </div>
          <div className="self-start bg-white/20 px-3 py-2 rounded-lg rounded-bl-none max-w-[80%]">
            Awesome! Show me trending ones.
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <input
            type="text"
            placeholder="Type your question..."
            className="w-full px-3 py-2 rounded-md bg-white/20 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm transition-all">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export const SkeletonFour = () => {
  return (
    <div className="relative flex items-start justify-center py-2 overflow-visible">
      <div className="w-[300px] h-[300px] md:w-[360px] md:h-[360px] flex justify-center items-center">
        <Globe />
      </div>
    </div>
  );
};

export const Globe = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvasRef.current.getBoundingClientRect();
    const width = Math.max(300, Math.floor(rect.width * dpr));
    const height = Math.max(300, Math.floor(rect.height * dpr));

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: dpr,
      width,
      height,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.6, 0.3, 1],
      glowColor: [1, 1, 1],
      markers: [
        { location: [37.7749, -122.4194], size: 0.05 },
        { location: [28.6139, 77.209], size: 0.08 },
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.005;
      },
    });

    return () => globe.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
      className="rounded-full"
    />
  );
};
