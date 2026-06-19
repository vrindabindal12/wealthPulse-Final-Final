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

const fetchCoins = async (search = "") => {
  const url = search
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/crypto/coins?search=${encodeURIComponent(search)}`
    : `${process.env.NEXT_PUBLIC_API_URL}/api/crypto/famous`; // <- NOTE: fetch famous coins for blank search
  const res = await fetch(url);
  if (!res.ok) return [];
  return await res.json();
};

export default function CryptoDashboardPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [loading, setLoading] = useState(false);
  const [coins, setCoins] = useState([]);
  const [displayedCoins, setDisplayedCoins] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    setLoading(true);
    fetchCoins(debouncedSearch).then((data) => {
      setCoins(data);
      // Show up to 8 matching results for queries
      const coinArr = debouncedSearch ? data.slice(0, 8) : data;
      setDisplayedCoins(coinArr);
      setNoResults(coinArr.length === 0);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching coins:', error);
      setLoading(false);
      setNoResults(true);
    });
  }, [debouncedSearch]);

  const onSearchChange = (e) => setSearch(e.target.value);
  const onClearSearch = () => {
    setSearch("");
    inputRef.current.focus();
  };

  return (
    <>
    <section className="relative min-h-screen bg-gradient-to-b from-[#050511] via-[#0d1020] to-[#0b0b12] py-16 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400">
              Crypto Markets
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
            Explore live prices, historical performance, and AI-driven analytics for top cryptocurrencies.
          </p>
        </div>

        {/* Searchbar */}
        <div className="flex justify-center mb-16 relative group max-w-xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl opacity-50 group-focus-within:opacity-100 transition-opacity duration-500 rounded-full"></div>
          <input
            ref={inputRef}
            value={search}
            onChange={onSearchChange}
            type="text"
            placeholder="Search coins by name or symbol…"
            className="relative w-full px-6 py-4 rounded-full bg-[#15182b]/80 backdrop-blur-xl border border-white/10 text-white text-lg focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 shadow-2xl transition-all placeholder:text-gray-500"
            aria-label="Search Cryptocurrencies"
          />
          {search && (
            <button
              onClick={onClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/20 hover:text-white transition-all z-10"
              aria-label="Clear Search"
            >
              ×
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="animate-spin border-4 border-purple-500/30 border-t-purple-500 rounded-full w-12 h-12"></span>
          </div>
        ) : noResults ? (
          <div className="flex flex-col items-center py-20 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/5">
            <span className="text-5xl mb-6 opacity-80">🔍</span>
            <span className="text-gray-300 text-xl font-medium">
              No cryptocurrencies found. Try another search!
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedCoins.map((coin) => (
              <Link href={`/CryptoDashboard/${coin.id}`} key={coin.id} className="block group">
                <div className="relative bg-[#15182b]/60 backdrop-blur-md border border-white/10 rounded-[1.5rem] p-6 shadow-xl flex flex-col hover:bg-[#1a1e36]/80 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_10px_40px_-10px_rgba(155,92,255,0.3)] hover:border-purple-500/30 transition-all duration-400 h-full overflow-hidden">
                  
                  {/* Decorative glow inside card */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors duration-500"></div>

                  {/* Header: Icon + Name */}
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    {coin.image ? (
                      <div className="w-12 h-12 rounded-full bg-white/5 p-2 shadow-inner border border-white/5 flex-shrink-0">
                        <img src={coin.image} alt={coin.name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold shadow-inner flex-shrink-0">
                        {coin.symbol.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h3 className="text-xl font-bold text-white tracking-tight truncate">{coin.name}</h3>
                      <div className="text-xs text-purple-300/70 font-semibold uppercase tracking-widest mt-0.5">{coin.symbol}</div>
                    </div>
                  </div>

                  {/* Price Area */}
                  <div className="mb-8 relative z-10">
                    <div className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Current Price</div>
                    <div className="text-3xl font-extrabold text-white flex items-baseline gap-1">
                      <span className="text-purple-400/80 text-xl font-medium">$</span>
                      {coin.current_price ? coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : '---'}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto relative z-10">
                    <button className="w-full inline-flex justify-center items-center gap-2 bg-white/5 text-gray-300 text-sm font-bold px-4 py-3.5 rounded-xl border border-white/5 group-hover:text-white group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                      View Analytics →
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="absolute left-0 right-0 bottom-0 h-48 bg-gradient-to-t from-[#0b0710]/80 to-transparent" />
    </section>
    <Chatbot currentPage="crypto" />
    </>
  );
}
