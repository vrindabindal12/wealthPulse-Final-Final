"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
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
      <section className="min-h-screen pt-24 px-7 pb-18 bg-[#F5F5F5] flex flex-col text-black">
      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10 w-full">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-medium mb-4 tracking-tight text-black" style={{ letterSpacing: '-0.04em' }}>
            Stock Markets.
          </h1>
          <p className="text-black/60 text-lg max-w-2xl mx-auto font-normal">
            Explore live prices, historical performance, and AI-driven analytics for top stocks.
          </p>
        </div>

        {/* Searchbar */}
        <div className="flex justify-center mb-16 relative group max-w-xl mx-auto">
          <div className="absolute inset-0 bg-black/5 blur-xl opacity-50 group-focus-within:opacity-100 transition-opacity duration-500 rounded-full"></div>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
            placeholder="Search stock symbol (e.g. TCS.NS)…"
            className="relative w-full px-6 py-4 rounded-full bg-white border border-black/10 text-black text-lg focus:outline-none focus:border-black/35 focus:ring-2 focus:ring-black/5 shadow-xs transition-all placeholder:text-black/40 font-medium"
            aria-label="Search Stocks"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
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
        ) : error ? (
          <div className="flex flex-col items-center py-20 bg-red-500/5 rounded-3xl border border-red-500/10">
            <span className="text-5xl mb-6 opacity-80">⚠️</span>
            <span className="text-red-600 text-xl font-medium">{error}</span>
          </div>
        ) : currentStocks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-10">
            {currentStocks.map((stock) => (
              <Link href={`/StockDashboard/${stock.symbol}`} key={stock.symbol} className="block group">
                <div className="relative bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs flex flex-col hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] hover:border-black/15 transition-all duration-400 h-full overflow-hidden">
                  
                  {/* Header: Icon + Name */}
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold shadow-inner flex-shrink-0">
                      {stock.symbol.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-xl font-medium text-black tracking-tight truncate" title={stock.longName || stock.symbol}>
                        {stock.longName || stock.symbol}
                      </h3>
                      <div className="text-xs text-black/40 font-semibold uppercase tracking-widest mt-0.5">{stock.symbol}</div>
                    </div>
                  </div>

                  {/* Spacer for structural consistency */}
                  <div className="mb-8 relative z-10 flex-grow">
                    <div className="text-xs text-black/40 mb-1.5 uppercase tracking-wider font-semibold">Asset Class</div>
                    <div className="text-base font-medium text-black/70">Equity</div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto relative z-10">
                    <button className="w-full inline-flex justify-center items-center gap-2 bg-black/5 text-black text-sm font-semibold px-4 py-3.5 rounded-xl border border-black/5 group-hover:text-white group-hover:bg-black group-hover:border-transparent transition-all duration-300">
                      View Analytics →
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 bg-white border border-black/5 rounded-3xl">
            <span className="text-5xl mb-6 opacity-80">🔍</span>
            <span className="text-black/60 text-xl font-medium">
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
