import { useState, useEffect } from "react";
import { close, logo, menu } from "../assets";
import { navLinks } from "../constants";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = () => {
  const { logout, loginWithRedirect, user, isAuthenticated } = useAuth0();
  const [active, setActive] = useState("Home");
  const [toggle, setToggle] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  // Toggle dropdown for "Options"
  const handleDropdownToggle = () => {
    setDropdown((prev) => !prev);
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdown) return;
    const closeDropdown = () => setDropdown(false);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [dropdown]);

  // Handle navigation with smooth scrolling for "Features"
  const handleNavClick = (navId, navTitle) => {
    setActive(navTitle);
    if (navId === "features") {
      // Navigate to home and scroll to features section
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById("features");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 0); // Delay ensures DOM updates after navigation
    } else if (navId !== "Options") {
      // Regular navigation for other links
      navigate(navId === "home" ? "/" : `/${navId}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/60 backdrop-blur-2xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.15)] transition-all duration-300">
      <div className="max-w-[1600px] w-full mx-auto px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between">

        {/* Branding Logo */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-[1px] shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-500">
            <div className="w-full h-full bg-black rounded-[11px] flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-violet-400 to-fuchsia-400 animate-pulse" />
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight text-white/90 group-hover:text-white transition-colors">
            WealthPulse
          </span>
        </Link>

        {/* Desktop Navigation Link Menu */}
        <ul className="list-none sm:flex hidden justify-end items-center flex-1 gap-2">
          {navLinks.map((nav) => (
            <li key={nav.id} className="relative font-poppins font-medium cursor-pointer text-sm">
              {nav.id === "Options" ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropdownToggle();
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all duration-300 select-none ${dropdown || active === "Options"
                        ? "text-white bg-white/10 border-white/10 shadow-[0_2px_10px_rgba(255,255,255,0.05)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
                      }`}
                  >
                    {nav.title}
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${dropdown ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Options Menu */}
                  {dropdown && (
                    <ul className="absolute top-[calc(100%+8px)] left-0 bg-[#07070a]/95 backdrop-blur-2xl border border-white/10 p-1.5 rounded-2xl shadow-2xl w-[180px] z-50 flex flex-col gap-1">
                      <li>
                        <Link
                          to="/dashboard/stocks"
                          onClick={() => setDropdown(false)}
                          className="block text-gray-400 hover:text-white px-4 py-2 hover:bg-white/5 rounded-xl text-sm font-medium transition-all"
                        >
                          Stocks
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard/mutual-funds"
                          onClick={() => setDropdown(false)}
                          className="block text-gray-400 hover:text-white px-4 py-2 hover:bg-white/5 rounded-xl text-sm font-medium transition-all"
                        >
                          Mutual Funds
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard/crypto"
                          onClick={() => setDropdown(false)}
                          className="block text-gray-400 hover:text-white px-4 py-2 hover:bg-white/5 rounded-xl text-sm font-medium transition-all"
                        >
                          Crypto
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleNavClick(nav.id, nav.title)}
                  className={`px-4 py-2 rounded-full border transition-all duration-300 select-none ${active === nav.title
                      ? "text-white bg-white/10 border-white/10 shadow-[0_2px_10px_rgba(255,255,255,0.05)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
                    }`}
                >
                  {nav.title}
                </button>
              )}
            </li>
          ))}

          {/* Portfolio Link */}
          <li className="relative font-poppins font-medium cursor-pointer text-sm">
            <Link
              to="/dashboard/portfolio"
              onClick={() => setActive("Portfolio")}
              className={`px-4 py-2 rounded-full border transition-all duration-300 ${active === "Portfolio"
                  ? "text-white bg-white/10 border-white/10 shadow-[0_2px_10px_rgba(255,255,255,0.05)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
                }`}
            >
              Portfolio
            </Link>
          </li>

          {/* Auth Button */}
          {isAuthenticated ? (
            <li className="ml-4">
              <button
                type="button"
                className="py-2 px-5 text-sm font-bold tracking-wide text-white transition-all duration-300 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 rounded-full hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_35px_rgba(217,70,239,0.3)] border border-white/20 hover:border-white/40 cursor-pointer outline-none"
                onClick={() => logout({ returnTo: window.location.origin })}
              >
                Logout
              </button>
            </li>
          ) : (
            <li className="ml-4">
              <button
                type="button"
                className="py-2 px-5 text-sm font-bold tracking-wide text-white transition-all duration-300 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 rounded-full hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_35px_rgba(217,70,239,0.3)] border border-white/20 hover:border-white/40 cursor-pointer outline-none"
                onClick={() => loginWithRedirect()}
              >
                Login
              </button>
            </li>
          )}
        </ul>

        {/* Mobile Toggle Button */}
        <div className="sm:hidden flex flex-1 justify-end items-center">
          <img
            src={toggle ? close : menu}
            alt="menu"
            className="w-[28px] h-[28px] object-contain cursor-pointer"
            onClick={() => setToggle(!toggle)}
          />

          {/* Mobile Dropdown Overlay */}
          {toggle && (
            <div className="absolute top-[70px] right-0 left-0 bg-[#050508]/95 backdrop-blur-2xl border-b border-white/5 shadow-2xl p-6 flex flex-col gap-4">
              <ul className="list-none flex flex-col gap-3">
                {navLinks.map((nav) => (
                  <li key={nav.id} className="w-full">
                    {nav.id === "Options" ? (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleDropdownToggle}
                          className="flex items-center justify-between w-full text-gray-400 hover:text-white transition-colors text-base font-semibold py-2 px-4 rounded-xl hover:bg-white/5"
                        >
                          <span>{nav.title}</span>
                          <svg
                            className={`w-4 h-4 transition-transform duration-300 ${dropdown ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {dropdown && (
                          <ul className="pl-6 border-l border-white/10 flex flex-col gap-2 mt-1">
                            <li>
                              <Link
                                to="/dashboard/stocks"
                                onClick={() => {
                                  setDropdown(false);
                                  setToggle(false);
                                }}
                                className="block text-gray-400 hover:text-white py-2 text-sm transition-colors"
                              >
                                Stocks
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="/dashboard/mutual-funds"
                                onClick={() => {
                                  setDropdown(false);
                                  setToggle(false);
                                }}
                                className="block text-gray-400 hover:text-white py-2 text-sm transition-colors"
                              >
                                Mutual Funds
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="/dashboard/crypto"
                                onClick={() => {
                                  setDropdown(false);
                                  setToggle(false);
                                }}
                                className="block text-gray-400 hover:text-white py-2 text-sm transition-colors"
                              >
                                Crypto
                              </Link>
                            </li>
                          </ul>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          handleNavClick(nav.id, nav.title);
                          setToggle(false);
                        }}
                        className={`block w-full text-left font-semibold text-base py-2 px-4 rounded-xl transition-all ${active === nav.title
                            ? "text-white bg-white/10"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        {nav.title}
                      </button>
                    )}
                  </li>
                ))}

                {/* Portfolio Link */}
                <li className="w-full">
                  <Link
                    to="/dashboard/portfolio"
                    onClick={() => {
                      setActive("Portfolio");
                      setToggle(false);
                    }}
                    className={`block font-semibold text-base py-2 px-4 rounded-xl transition-all ${active === "Portfolio"
                        ? "text-white bg-white/10"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    Portfolio
                  </Link>
                </li>

                {/* Mobile Auth Button */}
                {isAuthenticated ? (
                  <li className="mt-4">
                    <button
                      type="button"
                      className="w-full py-3 text-sm font-bold tracking-wide text-white bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 rounded-full shadow-lg"
                      onClick={() => {
                        logout({ returnTo: window.location.origin });
                        setToggle(false);
                      }}
                    >
                      Logout
                    </button>
                  </li>
                ) : (
                  <li className="mt-4">
                    <button
                      type="button"
                      className="w-full py-3 text-sm font-bold tracking-wide text-white bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 rounded-full shadow-lg"
                      onClick={() => {
                        loginWithRedirect();
                        setToggle(false);
                      }}
                    >
                      Login
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
