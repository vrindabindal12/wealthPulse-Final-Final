"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Chatbot from "../components/Chatbot";

// Debounce utility
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
};

const fetchSchemes = async (search = "") => {
  const url = search
    ? `/api/backend/mutual/schemes?search=${encodeURIComponent(search)}`
    : `/api/backend/mutual/schemes`;
  const res = await fetch(url);
  if (!res.ok) return {};
  return await res.json();
};

function getRandomMFs(schemesObj, count = 6) {
  const entries = Object.entries(schemesObj);
  if (entries.length <= count) return entries;
  const shuffled = entries.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function MFDashboardPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState({});
  const [displayedMfs, setDisplayedMfs] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    setLoading(true);
    fetchSchemes(debouncedSearch).then((data) => {
      setSchemes(data);
      if (debouncedSearch) {
        // Show up to 8 matching results for queries
        const mfArr = Object.entries(data).slice(0, 8);
        setDisplayedMfs(mfArr);
        setNoResults(mfArr.length === 0);
      } else {
        // Show 6 random funds for blank search
        const mfArr = getRandomMFs(data, 6);
        setDisplayedMfs(mfArr);
        setNoResults(mfArr.length === 0);
      }
      setLoading(false);
    });
  }, [debouncedSearch]);

  const onSearchChange = (e) => setSearch(e.target.value);
  const onClearSearch = () => {
    setSearch("");
    inputRef.current.focus();
  };

  return (
    <>
      <section className="relative min-h-screen bg-[#F5F5F5] py-16 text-black">
        <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-medium mb-4 tracking-tight text-black" style={{ letterSpacing: '-0.04em' }}>
              Mutual Funds.
            </h1>
            <p className="text-black/60 text-lg max-w-2xl mx-auto font-normal">
              Explore NAV data, historical performance, and risk metrics for top Indian Mutual Funds.
            </p>
          </div>

          {/* Searchbar */}
          <div className="flex justify-center mb-16 relative group max-w-xl mx-auto">
            <div className="absolute inset-0 bg-black/5 blur-xl opacity-50 group-focus-within:opacity-100 transition-opacity duration-500 rounded-full"></div>
            <input
              ref={inputRef}
              value={search}
              onChange={onSearchChange}
              type="text"
              placeholder="Search Mutual Funds by name…"
              className="relative w-full px-6 py-4 rounded-full bg-white border border-black/10 text-black text-lg focus:outline-none focus:border-black/35 focus:ring-2 focus:ring-black/5 shadow-xs transition-all placeholder:text-black/40 font-medium"
              aria-label="Search Mutual Funds"
            />
            {search && (
              <button
                onClick={onClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 text-black/60 hover:bg-black/20 hover:text-black transition-all z-10"
                aria-label="Clear Search"
              >
                ×
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <span className="animate-spin border-4 border-black/10 border-t-black rounded-full w-12 h-12"></span>
            </div>
          ) : noResults ? (
            <div className="flex flex-col items-center py-20 bg-white border border-black/5 rounded-3xl">
              <span className="text-5xl mb-6 opacity-80">😕</span>
              <span className="text-black/60 text-xl font-medium">
                No mutual funds found. Try another search!
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-10">
              {displayedMfs.map(([code, name]) => (
                <Link href={`/MFDashboard/${code}`} key={code} className="block group">
                  <div className="relative bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs flex flex-col hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] hover:border-black/15 transition-all duration-400 h-full overflow-hidden">
                    
                    {/* Header: Icon + Name */}
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-black/5 border border-black/5 flex items-center justify-center text-xl shadow-inner flex-shrink-0">
                        📊
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-lg font-medium text-black tracking-tight leading-tight line-clamp-2" title={name}>
                          {name}
                        </h3>
                        <div className="text-xs text-black/40 font-semibold uppercase tracking-widest mt-1">CODE: {code}</div>
                      </div>
                    </div>

                    {/* Spacer for structural consistency */}
                    <div className="mb-8 relative z-10 flex-grow">
                      <div className="text-xs text-black/40 mb-1.5 uppercase tracking-wider font-semibold">Asset Class</div>
                      <div className="text-lg font-medium text-black/70">Mutual Fund</div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto relative z-10">
                      <button className="w-full inline-flex justify-center items-center gap-2 bg-black/5 text-black text-sm font-semibold px-4 py-3.5 rounded-xl border border-black/5 group-hover:text-white group-hover:bg-black group-hover:border-transparent transition-all duration-300">
                        View Details →
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Chatbot currentPage="mutual-funds" />
    </>
  );
}
