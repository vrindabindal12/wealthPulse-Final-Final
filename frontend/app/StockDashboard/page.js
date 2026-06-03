"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";

const stocksPerPage = 9;

function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

function getRandomSubset(arr, count) {
  if (!Array.isArray(arr)) return [];
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function StockDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  // Load random stocks initially (e.g., from backend API)
  useEffect(() => {
    if (debouncedSearch) return; // skip random-load if searching

    setLoading(true);
    setError("");
    fetch(`/api/backend/stock/list`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch stock list");
        const arr = await res.json();
        // arr should be [{ symbol: 'TCS.NS', longName: 'Tata Consultancy Services', ...}, ...]
        setStocks(getRandomSubset(arr, stocksPerPage));
        setPage(1);
      })
      .catch((e) => {
        setError("Could not fetch stocks.");
        setStocks([]);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  // Load searched stock if a symbol is entered
  useEffect(() => {
    if (!debouncedSearch) return;
    setLoading(true);
    setError("");
    fetch(
      `/api/backend/stock/search?symbol=${encodeURIComponent(debouncedSearch)}`,
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch stock");
        const data = await res.json();
        setStocks(data.found ? [data] : []);
        setPage(1);
      })
      .catch((e) => {
        setError("Could not fetch stock.");
        setStocks([]);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  const currentStocks = stocks.slice(
    (page - 1) * stocksPerPage,
    page * stocksPerPage,
  );

  return (
    <>
      <Navbar />
      <section className="min-h-screen px-7 py-18 bg-gradient-to-b from-[#050511] via-[#0d1020] to-[#0b0b12] flex flex-col">
      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Stock Markets
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
            Explore live prices, historical performance, and AI-driven analytics for top stocks.
          </p>
        </div>

        {/* Searchbar */}
        <div className="flex justify-center mb-16 relative group max-w-xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-50 group-focus-within:opacity-100 transition-opacity duration-500 rounded-full"></div>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
            placeholder="Search stock symbol (e.g. TCS.NS)…"
            className="relative w-full px-6 py-4 rounded-full bg-[#15182b]/80 backdrop-blur-xl border border-white/10 text-white text-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 shadow-2xl transition-all placeholder:text-gray-500"
            aria-label="Search Stocks"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/20 hover:text-white transition-all z-10"
              aria-label="Clear Search"
            >
              ×
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="animate-spin border-4 border-blue-500/30 border-t-blue-500 rounded-full w-12 h-12"></span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 bg-red-900/10 backdrop-blur-sm rounded-3xl border border-red-500/20">
            <span className="text-5xl mb-6 opacity-80">⚠️</span>
            <span className="text-red-300 text-xl font-medium">{error}</span>
          </div>
        ) : currentStocks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-10">
            {currentStocks.map((stock) => (
              <Link href={`/StockDashboard/${stock.symbol}`} key={stock.symbol} className="block group">
                <div className="relative bg-[#15182b]/60 backdrop-blur-md border border-white/10 rounded-[1.5rem] p-6 shadow-xl flex flex-col hover:bg-[#1a1e36]/80 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.3)] hover:border-blue-500/30 transition-all duration-400 h-full overflow-hidden">
                  
                  {/* Decorative glow inside card */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors duration-500"></div>

                  {/* Header: Icon + Name */}
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xl font-bold shadow-inner flex-shrink-0">
                      {stock.symbol.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-xl font-bold text-white tracking-tight truncate" title={stock.longName || stock.symbol}>
                        {stock.longName || stock.symbol}
                      </h3>
                      <div className="text-xs text-blue-300/70 font-semibold uppercase tracking-widest mt-0.5">{stock.symbol}</div>
                    </div>
                  </div>

                  {/* Spacer for structural consistency */}
                  <div className="mb-8 relative z-10 flex-grow">
                    <div className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Asset Class</div>
                    <div className="text-lg font-medium text-gray-300">Equity</div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto relative z-10">
                    <button className="w-full inline-flex justify-center items-center gap-2 bg-white/5 text-gray-300 text-sm font-bold px-4 py-3.5 rounded-xl border border-white/5 group-hover:text-white group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                      View Analytics →
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/5">
            <span className="text-5xl mb-6 opacity-80">🔍</span>
            <span className="text-gray-300 text-xl font-medium">
              No stocks found.
            </span>
          </div>
        )}
      </div>
      </section>
      <Chatbot currentPage="stocks" />
    </>
  );
}
