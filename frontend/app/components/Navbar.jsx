import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import useUser, { loginHref, logoutHref } from "@/lib/authClient";
import gsap from "gsap";
import { LogoIcon } from "./LogoIcon";

// ─── MAGNETIC BUTTON ────────────────────────────────────────────────────────
function MagneticButton({ children, href, className, onClick }) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
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

export const Navbar = () => {
  const { isSignedIn, user, isLoading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  const link = isSignedIn ? "/Portfolio" : `${loginHref}?screen_hint=signup`;

  useEffect(() => {
    if (navRef.current) {
      gsap.from(navRef.current, { y: -80, opacity: 0, duration: 1, ease: "power3.out", delay: 0.2 });
    }
  }, []);

  return (
    <header ref={navRef} className="absolute top-0 left-0 right-0 z-20">
      <div className="max-w-[88rem] mx-auto px-8 md:px-12 py-5 flex items-center justify-between">
        {/* Left Logo */}
        <Link href="/" className="flex items-center gap-2 select-none ml-2 md:ml-6">
          <LogoIcon className="w-7 h-7 text-black/90" />
          <span className="text-[24px] font-medium tracking-[-0.03em]">
            WealthPulse
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            ["Features", "/#features"],
            ["Stocks", "/StockDashboard"],
            ["Mutual Funds", "/MFDashboard"],
            ["Crypto", "/CryptoDashboard"],
            ["Education", "/Courses"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-[15px] font-medium text-black/65 hover:text-black tracking-[-0.01em] transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Auth Section */}
        <div className="hidden md:flex items-center gap-8">
          {isLoading ? (
            <div className="w-24 h-10 bg-gray-200 rounded-full animate-pulse" />
          ) : isSignedIn && user ? (
            <div className="flex items-center gap-3 rounded-full px-3 py-2 bg-black text-white">
              <img src={user.picture || "/vercel.svg"} alt={user.name} className="w-6 h-6 rounded-full border border-white/20" />
              <a href={logoutHref} className="text-xs font-semibold text-gray-300 hover:text-white transition-colors">
                Sign out
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <a
                href={loginHref}
                className="text-[15px] font-medium text-black/65 hover:text-black tracking-[-0.01em] transition-colors duration-200"
              >
                Sign in
              </a>
              <MagneticButton
                href={`${loginHref}?screen_hint=signup`}
                className="inline-flex items-center justify-center bg-black text-white text-[15px] font-medium tracking-[-0.01em] px-6 py-2 rounded-full transition-colors duration-200 hover:bg-gray-800"
              >
                Get Started
              </MagneticButton>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-2 focus:outline-none"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle Menu"
        >
          <span className={`w-5 h-0.5 bg-black transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-5 h-0.5 bg-black transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`w-5 h-0.5 bg-black transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {menuOpen && (
        <nav className="md:hidden bg-[#F5F5F5] border-t border-black/5 px-6 py-6 flex flex-col gap-4 shadow-2xl">
          {[
            ["Features", "/#features"],
            ["Stocks", "/StockDashboard"],
            ["Mutual Funds", "/MFDashboard"],
            ["Crypto", "/CryptoDashboard"],
            ["Education", "/Courses"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-black/70 hover:text-black font-semibold text-base py-2 px-4 rounded-xl hover:bg-black/5 transition-all"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="mt-4 pt-4 border-t border-black/10 flex flex-col gap-3">
            {isLoading ? (
              <div className="w-full h-12 bg-black/5 rounded-full animate-pulse" />
            ) : isSignedIn && user ? (
              <div className="flex items-center justify-between bg-black text-white p-3 rounded-full px-5">
                <div className="flex items-center gap-3">
                  <img src={user.picture || "/vercel.svg"} alt={user.name} className="w-6 h-6 rounded-full" />
                  <span className="text-sm font-semibold truncate max-w-[120px]">{user.name}</span>
                </div>
                <a href={logoutHref} className="text-xs font-semibold text-gray-300 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                  Sign out
                </a>
              </div>
            ) : (
              <>
                <a
                  href={loginHref}
                  className="text-center text-sm font-semibold text-black/70 hover:text-black py-3 rounded-xl hover:bg-black/5 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </a>
                <Link
                  href={link}
                  className="inline-flex items-center justify-center bg-black text-white text-[15px] font-medium tracking-[-0.01em] py-3 rounded-full text-center hover:bg-gray-800 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
