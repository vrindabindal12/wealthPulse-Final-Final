"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import Link from "next/link";
import useUser, { loginHref, logoutHref } from "@/lib/authClient";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// ─── MAGNETIC BUTTON ────────────────────────────────────────────────────────
function MagneticButton({ children, href, className, onClick }) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.4)" });
  };

  const Tag = href ? "a" : "button";

  return (
    <Tag
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </Tag>
  );
}

// ─── PARTICLE CANVAS ─────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      speed: 0.3 + Math.random() * 0.7,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.z -= p.speed * 0.004;
        if (p.z <= 0) { p.x = Math.random(); p.y = Math.random(); p.z = 1; }
        const sx = (p.x - 0.5) * canvas.width / p.z + canvas.width / 2;
        const sy = (p.y - 0.5) * canvas.height / p.z + canvas.height / 2;
        const r = (1 - p.z) * 1.8;
        const a = (1 - p.z) * 0.8;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,140,255,${a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ─── TICKER ──────────────────────────────────────────────────────────────────
function Ticker() {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const totalW = track.scrollWidth / 2;
    gsap.to(track, { x: -totalW, duration: 25, ease: "none", repeat: -1 });
  }, []);

  const items = ["Real-Time Analytics", "AI Portfolio Insights", "Risk Modeling", "Crypto Markets", "Mutual Funds", "Global Indices", "Options Flow", "Sentiment Analysis"];

  return (
    <div className="w-full overflow-hidden border-y border-white/5 py-4 bg-white/[0.02]">
      <div ref={trackRef} className="flex gap-16 w-max">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-xs font-mono tracking-[0.4em] uppercase text-white/30 whitespace-nowrap flex items-center gap-4">
            <span className="w-1 h-1 rounded-full bg-violet-500 inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ value, label }) {
  const ref = useRef(null);

  useEffect(() => {
    const num = parseFloat(value);
    const suffix = value.replace(/[\d.]/g, "");
    gsap.from({ val: 0 }, {
      val: num,
      duration: 2.5,
      ease: "power2.out",
      snap: { val: num < 10 ? 0.1 : 1 },
      scrollTrigger: { trigger: ref.current, start: "top 85%" },
      onUpdate() { ref.current.querySelector(".num").textContent = this.targets()[0].val.toFixed(num < 10 ? 1 : 0) + suffix; },
    });
  }, [value]);

  return (
    <div ref={ref} className="border border-white/5 p-8 bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-500 group">
      <div className="num text-5xl md:text-7xl font-black tracking-tighter text-white mb-2 group-hover:text-violet-300 transition-colors duration-500">0</div>
      <div className="text-sm text-white/30 uppercase tracking-[0.3em] font-medium">{label}</div>
    </div>
  );
}

// ─── FEATURE CARD ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, index }) {
  const ref = useRef(null);

  useEffect(() => {
    gsap.from(ref.current, {
      scrollTrigger: { trigger: ref.current, start: "top 88%" },
      y: 60,
      opacity: 0,
      duration: 1,
      delay: index * 0.12,
      ease: "power3.out",
    });
  }, [index]);

  return (
    <div
      ref={ref}
      className="group relative border border-white/5 p-8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-violet-500/30 transition-all duration-700 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="text-5xl mb-6">{icon}</div>
      <h3 className="text-xl font-bold tracking-tight text-white mb-3">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
      <div className="absolute bottom-6 right-6 text-white/10 font-mono text-[10px] tracking-widest uppercase">
        MOD_{String(index + 1).padStart(2, "0")}
      </div>
    </div>
  );
}

// ─── TESTIMONIAL ─────────────────────────────────────────────────────────────
function TestimonialCard({ quote, name, title, initials, delay }) {
  const ref = useRef(null);

  useEffect(() => {
    gsap.from(ref.current, {
      scrollTrigger: { trigger: ref.current, start: "top 88%" },
      y: 40,
      opacity: 0,
      duration: 1,
      delay,
      ease: "power3.out",
    });
  }, [delay]);

  return (
    <div ref={ref} className="group border border-white/5 p-8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-700 flex flex-col gap-6">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => <span key={i} className="text-violet-400 text-sm">★</span>)}
      </div>
      <p className="text-white/60 text-sm leading-relaxed flex-1">"{quote}"</p>
      <div className="flex items-center gap-3 border-t border-white/5 pt-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white">
          {initials}
        </div>
        <div>
          <div className="text-white text-sm font-semibold">{name}</div>
          <div className="text-white/30 text-[11px] uppercase tracking-widest">{title}</div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN LANDING PAGE ────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isSignedIn, user, isLoading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const heroRef = useRef(null);
  const headlineRef = useRef(null);
  const subRef = useRef(null);
  const ctaRowRef = useRef(null);
  const mockupRef = useRef(null);
  const glowRef = useRef(null);
  const navRef = useRef(null);
  const dividerRef = useRef(null);

  const link = isSignedIn ? "/Portfolio" : `${loginHref}?screen_hint=signup`;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── NAV ENTRANCE ──
      gsap.from(navRef.current, { y: -80, opacity: 0, duration: 1, ease: "power3.out", delay: 0.2 });

      // ── HEADLINE letter-by-letter BUILD ──
      const words = headlineRef.current.querySelectorAll(".word");
      gsap.from(words, {
        y: "110%",
        opacity: 0,
        rotateX: -30,
        stagger: 0.08,
        duration: 1,
        ease: "expo.out",
        delay: 0.6,
      });

      // ── SUBTITLE + CTA ──
      gsap.from(subRef.current, { y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 1.2 });
      gsap.from(ctaRowRef.current, { y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 1.5 });

      // ── GLOW PULSE ──
      gsap.to(glowRef.current, {
        scale: 1.4,
        opacity: 0.6,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      // ── MOCKUP ENTRANCE + PARALLAX ──
      gsap.from(mockupRef.current, {
        y: 120,
        opacity: 0,
        scale: 0.9,
        duration: 1.8,
        ease: "expo.out",
        delay: 1.8,
      });

      gsap.to(mockupRef.current, {
        y: -60,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      // ── DIVIDER WIPE ──
      gsap.from(dividerRef.current, {
        scaleX: 0,
        duration: 2,
        ease: "expo.out",
        scrollTrigger: { trigger: dividerRef.current, start: "top 90%" },
      });

      // ── SECTION HEADINGS ──
      gsap.utils.toArray(".section-heading").forEach((el) => {
        const words = el.querySelectorAll(".word");
        gsap.from(words, {
          scrollTrigger: { trigger: el, start: "top 85%" },
          y: "110%",
          opacity: 0,
          stagger: 0.07,
          duration: 1.1,
          ease: "expo.out",
          rotateX: -20,
        });
      });

      // ── NAVBAR SCROLL BEHAVIOR ──
      ScrollTrigger.create({
        start: "top -80",
        onEnter: () => gsap.to(navRef.current, { backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", duration: 0.4 }),
        onLeaveBack: () => gsap.to(navRef.current, { backgroundColor: "transparent", backdropFilter: "blur(0px)", duration: 0.4 }),
      });
    });

    return () => ctx.revert();
  }, []);

  const headline = "WealthPulse: The Future of Personal Finance.";
  const headlineWords = headline.split(" ").map((w, i) => (
    <span key={i} className="overflow-hidden inline-block mr-[0.25em]">
      <span className="word inline-block">{w}</span>
    </span>
  ));

  const features = [
    { icon: "⚡", title: "Real-Time Market Data", desc: "Live feeds from global exchanges. Every tick, every second, with sub-millisecond latency." },
    { icon: "🧠", title: "AI Portfolio Coach", desc: "Your personal AI analyzes risk, spots opportunities, and rebalances 24/7 while you sleep." },
    { icon: "🌐", title: "Global Asset Coverage", desc: "Stocks, ETFs, mutual funds, crypto, commodities — all unified in one intelligent dashboard." },
    { icon: "📊", title: "Predictive Analytics", desc: "Machine-learning models trained on decades of market data surface patterns before they emerge." },
    { icon: "🔐", title: "Bank-Grade Security", desc: "End-to-end encryption, 2FA, and zero-trust architecture protect every transaction you make." },
    { icon: "📚", title: "Education Hub", desc: "Curated masterclasses, live sessions, and AI-generated briefs to sharpen your edge every day." },
  ];

  const stats = [
    { value: "2.4B+", label: "Assets Tracked" },
    { value: "98.9%", label: "Uptime SLA" },
    { value: "50K+", label: "Active Investors" },
    { value: "140+", label: "Markets Covered" },
  ];

  const testimonials = [
    { quote: "WealthPulse completely changed how I think about investing. The AI coach caught a risk in my portfolio I would have missed for months.", name: "Aarav Sharma", title: "Founder, Nexus Labs", initials: "AS", delay: 0 },
    { quote: "I've tried every finance app out there. Nothing comes close to the depth and speed of WealthPulse's real-time analytics.", name: "Priya Mehta", title: "Hedge Fund Analyst", initials: "PM", delay: 0.1 },
    { quote: "The education hub alone is worth it. I went from knowing nothing to confidently managing a diversified portfolio in 3 months.", name: "Rahul Khanna", title: "Software Engineer", initials: "RK", delay: 0.2 },
    { quote: "Our entire family uses WealthPulse to track our investments. The UI is stunning — my parents love it too.", name: "Neha Kapoor", title: "Entrepreneur", initials: "NK", delay: 0.3 },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <ParticleCanvas />

      {/* Ambient glow — permanently behind everything */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full z-0"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)" }}
      />

      {/* ══════════════════════════ NAVBAR ══════════════════════════ */}
      <header ref={navRef} className="fixed top-0 left-0 right-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-white/90" />
            </div>
            <span className="font-black text-lg tracking-tight">WealthPulse</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            {[
              ["Features", "#features"],
              ["Stocks", "/StockDashboard"],
              ["Mutual Funds", "/MFDashboard"],
              ["Crypto", "/CryptoDashboard"],
              ["Education", "/Courses"],
            ].map(([label, href]) => (
              <a key={label} href={href} className="text-white/40 hover:text-white transition-colors duration-300 tracking-wide">
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <div className="w-20 h-8 bg-white/5 rounded animate-pulse" />
            ) : isSignedIn && user ? (
              <div className="flex items-center gap-3">
                <img src={user.picture || "/vercel.svg"} alt={user.name} className="w-8 h-8 rounded-full border border-white/20" />
                <a href={logoutHref} className="text-xs text-white/50 hover:text-white border border-white/10 px-3 py-1.5 rounded transition-all hover:border-white/30">
                  Sign out
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a href={loginHref} className="text-sm text-white/50 hover:text-white transition-colors">Sign in</a>
                <MagneticButton
                  href={`${loginHref}?screen_hint=signup`}
                  className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-full font-semibold transition-all duration-300"
                >
                  Get Started
                </MagneticButton>
              </div>
            )}
          </div>

          <button className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5" onClick={() => setMenuOpen(o => !o)}>
            <span className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden bg-black/95 border-t border-white/5 px-6 py-6 flex flex-col gap-5">
            {[["Features", "#features"], ["Stocks", "/StockDashboard"], ["Mutual Funds", "/MFDashboard"], ["Crypto", "/CryptoDashboard"], ["Education", "/Courses"]].map(([label, href]) => (
              <a key={label} href={href} className="text-white/50 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <a href={link} className="text-sm bg-violet-600 text-white px-5 py-2.5 rounded-full font-semibold text-center mt-2">Get Started</a>
          </nav>
        )}
      </header>

      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section ref={heroRef} className="relative z-10 pt-36 pb-20 px-6 min-h-screen flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-mono text-violet-400 tracking-widest uppercase">Platform v2.0 — Now Live</span>
          </div>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className="text-5xl sm:text-7xl md:text-8xl font-black leading-[1.0] tracking-tighter max-w-5xl mb-8"
            style={{ perspective: "800px" }}
          >
            {headlineWords}
          </h1>

          {/* Subtitle */}
          <p ref={subRef} className="text-lg md:text-xl text-white/40 max-w-2xl leading-relaxed mb-12 font-light">
            Institutional-grade analytics, AI-powered insights, and cinematic design — built for the investor who demands more from every market.
          </p>

          {/* CTA Row */}
          <div ref={ctaRowRef} className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <MagneticButton
              href={link}
              className="group relative inline-flex items-center gap-3 bg-white text-black font-black text-base px-8 py-4 rounded-full overflow-hidden transition-all duration-500 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            >
              <span className="relative z-10">Enter the Platform</span>
              <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </MagneticButton>

            <a href="#features" className="group inline-flex items-center gap-2 text-white/40 hover:text-white font-medium transition-colors duration-300">
              <span>Explore Features</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["AS", "PM", "RK", "NK"].map((init, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 border-2 border-black flex items-center justify-center text-[8px] font-bold text-white">{init}</div>
              ))}
            </div>
            <p className="text-xs text-white/30">Trusted by <span className="text-white/60 font-semibold">50,000+</span> investors worldwide</p>
          </div>
        </div>

        {/* MOCKUP */}
        <div ref={mockupRef} className="relative z-10 max-w-7xl mx-auto mt-24 px-0 md:px-6">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-blue-600/20 rounded-[2rem] blur-[80px] opacity-60 animate-pulse" />
          <div className="relative rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)] group">
            {/* Top Bar */}
            <div className="bg-[#0a0a0a] border-b border-white/5 px-5 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="ml-4 text-xs text-white/20 font-mono">wealthpulse.io/dashboard</div>
            </div>
            <img
              src="/dashboard-mock.png"
              alt="WealthPulse Dashboard"
              className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Floating Stats */}
            <div className="absolute bottom-8 left-8 right-8 flex flex-wrap gap-3 pointer-events-none">
              {[
                { label: "Portfolio Return", value: "+24.7%", color: "from-emerald-500 to-teal-500" },
                { label: "Risk Score", value: "A+", color: "from-violet-500 to-purple-600" },
                { label: "AI Signal", value: "BULLISH", color: "from-amber-500 to-orange-500" },
              ].map((stat, i) => (
                <div key={i} className="bg-black/70 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`} />
                  <div>
                    <div className="text-white/30 text-[9px] uppercase tracking-widest">{stat.label}</div>
                    <div className="text-white font-black text-sm">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll nudge */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent animate-pulse" />
          <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/50">Scroll</span>
        </div>
      </section>

      {/* ══════════════════════════ TICKER ══════════════════════════ */}
      <div className="relative z-10">
        <Ticker />
      </div>

      {/* ══════════════════════════ STATS ══════════════════════════ */}
      <section className="relative z-10 py-24 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      </section>

      {/* ══════════════════════════ FEATURES ══════════════════════════ */}
      <section id="features" className="relative z-10 py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24">
            <div className="text-xs font-mono text-violet-400 tracking-[0.5em] uppercase mb-6">Core Systems</div>
            <h2 className="section-heading text-5xl md:text-7xl font-black tracking-tighter leading-none max-w-3xl" style={{ perspective: "600px" }}>
              {["Everything", "you need.", "Nothing", "you don't."].map((w, i) => (
                <span key={i} className="overflow-hidden inline-block mr-[0.3em]">
                  <span className="word inline-block">{w}</span>
                </span>
              ))}
            </h2>
          </div>

          <div ref={dividerRef} className="origin-left h-px bg-gradient-to-r from-violet-500 to-transparent mb-24" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {features.map((f, i) => <FeatureCard key={i} {...f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ SOCIAL PROOF STRIP ══════════════════════════ */}
      <section className="relative z-10 py-24 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <div className="text-xs font-mono text-white/20 uppercase tracking-widest mb-3">Powered by Intelligence</div>
            <p className="text-3xl md:text-5xl font-black tracking-tighter leading-tight max-w-xl">
              AI that works while{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">you sleep.</span>
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {["Portfolio Rebalancing", "Risk Alerts", "Tax Optimization", "Sentiment Shifts", "Earnings Forecasts", "Market Anomalies"].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/50">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ TESTIMONIALS ══════════════════════════ */}
      <section className="relative z-10 py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <div className="text-xs font-mono text-violet-400 tracking-[0.5em] uppercase mb-6">What People Say</div>
            <h2 className="section-heading text-5xl md:text-7xl font-black tracking-tighter leading-none" style={{ perspective: "600px" }}>
              {["Real results.", "Real people."].map((w, i) => (
                <span key={i} className="overflow-hidden inline-block mr-[0.3em]">
                  <span className="word inline-block">{w}</span>
                </span>
              ))}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {testimonials.map((t, i) => <TestimonialCard key={i} {...t} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ CTA ══════════════════════════ */}
      <section className="relative z-10 py-48 px-6 overflow-hidden border-t border-white/5">
        {/* Concentric glow rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[300, 500, 700, 900, 1100].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-violet-500/10 animate-ping"
              style={{ width: size, height: size, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + i * 0.5}s` }}
            />
          ))}
          <div className="w-[600px] h-[600px] rounded-full absolute"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%)" }}
          />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="text-xs font-mono text-violet-400 tracking-[0.5em] uppercase mb-8">The Signal is Clear</div>
          <h2 className="section-heading text-6xl md:text-9xl font-black tracking-tighter leading-none mb-10" style={{ perspective: "600px" }}>
            {["Your edge.", "Starts now."].map((w, i) => (
              <span key={i} className="overflow-hidden inline-block mr-[0.3em]">
                <span className="word inline-block">{i === 1 ? <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-500">{w}</span> : w}</span>
              </span>
            ))}
          </h2>
          <p className="text-lg text-white/30 max-w-xl mx-auto mb-14 font-light leading-relaxed">
            Join 50,000+ investors already using WealthPulse to outperform the market with clarity and confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <MagneticButton
              href={link}
              className="group relative inline-flex items-center gap-3 bg-white text-black font-black text-lg px-10 py-5 rounded-full overflow-hidden transition-all duration-500 hover:scale-110 shadow-[0_0_80px_rgba(255,255,255,0.2)]"
            >
              <span className="relative z-10">Start Free — No Credit Card</span>
              <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </MagneticButton>
            <a href="/Courses" className="group text-white/30 hover:text-white font-medium transition-colors flex items-center gap-2">
              Explore Education Hub <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ FOOTER ══════════════════════════ */}
      <footer className="relative z-10 border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-white/90" />
            </div>
            <span className="font-black text-base tracking-tight">WealthPulse</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-white/25">
            {["Features", "Stocks", "Crypto", "Education", "Privacy", "Terms"].map(item => (
              <a key={item} href="#" className="hover:text-white/60 transition-colors">{item}</a>
            ))}
          </div>
          <p className="text-white/15 text-xs font-mono">© 2026 WealthPulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
