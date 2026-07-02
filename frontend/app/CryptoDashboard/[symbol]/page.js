"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import Chatbot from "../../components/Chatbot";
import useUser from "@/lib/authClient";
import CryptoAIDostModal from "../../components/CryptoAIDostModal";
import CryptoAIReportModal from "../../components/CryptoAIReportModal";

// Utility functions
function formatPct(val) {
  return isNaN(val) ? "--" : (val * 100).toFixed(2) + "%";
}
function formatCurrency(val, symbol = "$") {
  return isNaN(val)
    ? "--"
    : symbol +
        Number(val).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
}
function formatLargeCurrency(val, symbol = "$") {
  if (isNaN(val)) return "--";
  const num = Number(val);
  if (num >= 1e12) return symbol + (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return symbol + (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return symbol + (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return symbol + (num / 1e3).toFixed(2) + "K";
  return (
    symbol +
    num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

// Custom Heatmap Component using Bar Chart (Light Theme styled)
function PerformanceHeatmap({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No heatmap data available
      </div>
    );
  }

  // Format data for bar chart - take last 12 periods
  const chartData = data.slice(-12).map((item) => ({
    month: item.month || item.period || "N/A",
    value: item.dayChange || item.value || 0,
    displayValue: (item.dayChange || item.value || 0).toFixed(4),
  }));

  // Get color based on performance value
  const getColor = (value) => {
    if (value > 0.15) return "#eab308"; // Yellow for high positive
    if (value > 0.05) return "#84cc16"; // Light green
    if (value > 0) return "#10b981"; // Green
    if (value > -0.05) return "#6366f1"; // Purple/blue
    return "#8b5cf6"; // Dark purple for negative
  };

  return (
    <div className="w-full h-full bg-white rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickFormatter={(val) => (val * 100).toFixed(2) + "%"}
            reversed={false}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
            formatter={(value) => [
              (value * 100).toFixed(4) + "%",
              "Period Return",
            ]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Color Legend */}
      <div className="flex items-center justify-end gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#8b5cf6] rounded"></div>
          <span className="text-gray-600 font-medium">Negative</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#6366f1] rounded"></div>
          <span className="text-gray-600 font-medium">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#10b981] rounded"></div>
          <span className="text-gray-600 font-medium">Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#eab308] rounded"></div>
          <span className="text-gray-600 font-medium">High</span>
        </div>
      </div>
    </div>
  );
}

export default function CryptoDetailsPage() {
  const { symbol } = useParams();
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [riskVolatility, setRiskVolatility] = useState({});
  const [monteCarlo, setMonteCarlo] = useState({});
  const [amount, setAmount] = useState(1000);
  const [selectedPeriod, setSelectedPeriod] = useState("1M");

  // Compare cryptos state
  const [crypto1Query, setCrypto1Query] = useState("");
  const [crypto2Query, setCrypto2Query] = useState("");
  const [crypto1Suggestions, setCrypto1Suggestions] = useState([]);
  const [crypto2Suggestions, setCrypto2Suggestions] = useState([]);
  const [showCrypto1Dropdown, setShowCrypto1Dropdown] = useState(false);
  const [showCrypto2Dropdown, setShowCrypto2Dropdown] = useState(false);
  const [selectedCrypto1, setSelectedCrypto1] = useState(null);
  const [selectedCrypto2, setSelectedCrypto2] = useState(null);
  const [crypto1Data, setCrypto1Data] = useState(null);
  const [crypto2Data, setCrypto2Data] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  // Portfolio form state
  const [addingToPortfolio, setAddingToPortfolio] = useState(false);
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [buyDate, setBuyDate] = useState("");

  // AI Modal States
  const [showAIDost, setShowAIDost] = useState(false);
  const [showAIReport, setShowAIReport] = useState(false);

  const { user, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setBuyDate(new Date().toISOString().split("T")[0]);
    Promise.all([
      fetch(`/api/backend/crypto/coin-details/${symbol}`)
        .then((r) => {
          if (!r.ok) {
            console.error(`coin-details failed: ${r.status}`);
            return {};
          }
          return r.json();
        })
        .catch((e) => {
          console.error("coin-details error:", e);
          return {};
        }),
      fetch(`/api/backend/crypto/historical-price/${symbol}`)
        .then((r) => {
          if (!r.ok) {
            console.error(`historical-price failed: ${r.status}`);
            return [];
          }
          return r.json();
        })
        .catch((e) => {
          console.error("historical-price error:", e);
          return [];
        }),
      fetch(`/api/backend/crypto/performance-heatmap/${symbol}`)
        .then((r) => {
          if (!r.ok) {
            console.error(`performance-heatmap failed: ${r.status}`);
            return [];
          }
          return r.json();
        })
        .catch((e) => {
          console.error("performance-heatmap error:", e);
          return [];
        }),
      fetch(`/api/backend/crypto/risk-volatility/${symbol}`)
        .then((r) => {
          if (!r.ok) {
            console.error(`risk-volatility failed: ${r.status}`);
            return {};
          }
          return r.json();
        })
        .catch((e) => {
          console.error("risk-volatility error:", e);
          return {};
        }),
      fetch(`/api/backend/crypto/monte-carlo-prediction/${symbol}`)
        .then((r) => {
          if (!r.ok) {
            console.error(`monte-carlo-prediction failed: ${r.status}`);
            return {};
          }
          return r.json();
        })
        .catch((e) => {
          console.error("monte-carlo-prediction error:", e);
          return {};
        }),
    ])
      .then(([metaData, prices, heat, risk, mc]) => {
        console.log("Crypto data loaded:", {
          metaData,
          pricesCount: prices?.length,
          heatmapCount: heat?.length,
          risk,
          mc,
        });
        setMeta(metaData);
        setPriceHistory(prices || []);
        setHeatmap(heat || []);
        setRiskVolatility(risk || {});
        setMonteCarlo(mc || {});
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading crypto data:", error);
        setLoading(false);
      });
  }, [symbol]);

  // Debounced search for crypto 1
  useEffect(() => {
    if (crypto1Query.length < 1) {
      setCrypto1Suggestions([]);
      setShowCrypto1Dropdown(false);
      return;
    }
    setShowCrypto1Dropdown(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/backend/crypto/coins?search=${encodeURIComponent(crypto1Query)}`,
        );
        const data = await response.json();
        setCrypto1Suggestions(data || []);
      } catch (error) {
        console.error("Error fetching crypto suggestions:", error);
        setCrypto1Suggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [crypto1Query]);

  // Debounced search for crypto 2
  useEffect(() => {
    if (crypto2Query.length < 1) {
      setCrypto2Suggestions([]);
      setShowCrypto2Dropdown(false);
      return;
    }
    setShowCrypto2Dropdown(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/backend/crypto/coins?search=${encodeURIComponent(crypto2Query)}`,
        );
        const data = await response.json();
        setCrypto2Suggestions(data || []);
      } catch (error) {
        console.error("Error fetching crypto suggestions:", error);
        setCrypto2Suggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [crypto2Query]);

  // Fetch data for selected crypto 1
  useEffect(() => {
    if (!selectedCrypto1) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/backend/crypto/coin-details/${selectedCrypto1.id}`,
        );
        const data = await res.json();
        setCrypto1Data({ meta: data });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedCrypto1]);

  // Fetch data for selected crypto 2
  useEffect(() => {
    if (!selectedCrypto2) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/backend/crypto/coin-details/${selectedCrypto2.id}`,
        );
        const data = await res.json();
        setCrypto2Data({ meta: data });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedCrypto2]);

  // Calculate future returns
  const estReturn =
    amount * Math.pow(1 + (riskVolatility.annualized_return || 0), 1);
  const estProfit = estReturn - amount;

  // Handle crypto selection
  const handleCrypto1Select = (crypto) => {
    setSelectedCrypto1(crypto);
    setCrypto1Query(crypto.name);
    setShowCrypto1Dropdown(false);
  };

  const handleCrypto2Select = (crypto) => {
    setSelectedCrypto2(crypto);
    setCrypto2Query(crypto.name);
  };

  const handleAddToPortfolio = async () => {
    if (!isSignedIn || !user) {
      alert("Please sign in to add items to your portfolio");
      return;
    }

    const finalBuyPrice = buyPrice || meta?.current_price;
    if (!finalBuyPrice || finalBuyPrice <= 0) {
      alert("Please enter a valid buy price");
      return;
    }

    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (!buyDate) {
      alert("Please select a buy date");
      return;
    }

    try {
      setAddingToPortfolio(true);
      const payload = {
        symbol: symbol,
        name: meta?.name || symbol,
        asset_type: "crypto",
        buy_price: Number(finalBuyPrice),
        quantity: Number(quantity),
        buy_date: buyDate,
      };

      console.log("Adding to portfolio:", payload);

      const response = await fetch("/api/backend/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("API Response:", response.status, responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Error parsing response:", e);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        if (response.status === 400) {
          alert(data.detail || "Crypto already in portfolio");
        } else {
          let errorMsg = "Failed to add to portfolio";
          if (typeof data.detail === "string") {
            errorMsg = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMsg = data.detail.map(err => {
              const field = err.loc ? err.loc[err.loc.length - 1] : "";
              return `${field ? field + ": " : ""}${err.msg}`;
            }).join("\n");
          } else if (data.detail) {
            errorMsg = JSON.stringify(data.detail);
          }
          throw new Error(errorMsg);
        }
        return;
      }

      alert("Successfully added to portfolio!");
      setBuyPrice("");
      setQuantity(1);

      // Navigate to Portfolio page so user sees updated portfolio
      setTimeout(() => router.push("/Portfolio"), 1000);
    } catch (error) {
      console.error("Error adding to portfolio:", error);
      alert(error.message || "Failed to add to portfolio. Please try again.");
    } finally {
      setAddingToPortfolio(false);
    }
  };

  return (
    <>
      <Chatbot currentPage="crypto-detail" selectedItem={symbol} />
      
      {/* AI Dost & AI Report modals */}
      <CryptoAIDostModal
        isOpen={showAIDost}
        onClose={() => setShowAIDost(false)}
        cryptoData={{ meta, riskVolatility, monteCarlo }}
      />
      <CryptoAIReportModal
        isOpen={showAIReport}
        onClose={() => setShowAIReport(false)}
        cryptoData={{ meta, riskVolatility, monteCarlo }}
      />

      <section className="min-h-screen pt-28 pb-16 px-4 md:px-8 bg-[#F5F5F5] text-black">
        <div className="max-w-7xl mx-auto grid gap-8">
          {loading ? (
            <div className="flex justify-center items-center min-h-[60vh]">
              <span className="animate-spin border-4 border-black border-t-transparent rounded-full w-10 h-10"></span>
            </div>
          ) : (
            <>
              {/* Page Heading */}
              <div className="mb-6 py-8">
                <h1 className="text-4xl md:text-5xl font-medium text-black text-center tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                  Cryptocurrency Analytics.
                </h1>
              </div>

              {/* Crypto Name Display with AI Buttons */}
              <div className="mb-6">
                <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs max-w-xl mx-auto">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {meta?.image && (
                      <Image
                        src={meta.image}
                        alt={meta.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <h2 className="text-2xl font-bold text-black text-center tracking-tight">
                      {meta?.name || symbol}{" "}
                      {meta?.symbol && `(${meta.symbol.toUpperCase()})`}
                    </h2>
                  </div>

                  {meta?.current_price && (
                    <div className="text-center mb-6">
                      <span className="text-3xl font-bold text-black">
                        {formatCurrency(meta.current_price)}
                      </span>
                      {meta?.price_change_percentage_24h !== undefined && (
                        <span
                          className={`ml-3 text-lg font-semibold ${meta.price_change_percentage_24h >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {meta.price_change_percentage_24h >= 0 ? "+" : ""}
                          {meta.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}

                  {/* AI Buttons */}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setShowAIDost(true)}
                      className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full font-semibold transition-all transform hover:scale-[1.02] shadow-xs cursor-pointer flex items-center gap-2 text-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      AI Dost
                    </button>
                    <button
                      onClick={() => setShowAIReport(true)}
                      className="bg-black/5 hover:bg-black/10 text-black px-6 py-2.5 rounded-full font-semibold transition-all flex items-center gap-2 text-sm cursor-pointer border border-black/10"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      AI Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Grid - 2 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* LEFT COLUMN */}
                <div className="h-full flex flex-col gap-6">
                  {/* Crypto Details Card */}
                  <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs h-fit">
                    <h3 className="text-xl font-bold mb-4 text-black border-b border-black/5 pb-2">
                      Crypto Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          Symbol:
                        </span>
                        <span className="text-black font-semibold uppercase">
                          {meta?.symbol || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          Market Cap:
                        </span>
                        <span className="text-black font-semibold">
                          {formatLargeCurrency(meta?.market_cap || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          24h Volume:
                        </span>
                        <span className="text-black font-semibold">
                          {formatLargeCurrency(meta?.total_volume || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          All Time High:
                        </span>
                        <span className="text-black font-semibold">
                          {formatCurrency(meta?.ath || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          All Time Low:
                        </span>
                        <span className="text-black font-semibold">
                          {formatCurrency(meta?.atl || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          24h High:
                        </span>
                        <span className="text-black font-semibold">
                          {formatCurrency(meta?.high_24h || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          24h Low:
                        </span>
                        <span className="text-black font-semibold">
                          {formatCurrency(meta?.low_24h || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          Circulating Supply:
                        </span>
                        <span className="text-black font-semibold text-right">
                          {meta?.circulating_supply
                            ? Number(meta.circulating_supply).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4 mt-6 border-t border-black/5 pt-4">
                      <div>
                        <label className="block text-base mb-2">
                          <span className="text-black/60 font-semibold">
                            Buy Price ($):
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={
                            meta?.current_price
                              ? `Current: $${Number(meta.current_price).toFixed(2)}`
                              : "Enter price"
                          }
                          value={buyPrice}
                          onChange={(e) => setBuyPrice(e.target.value)}
                          className="w-full bg-black/5 border border-black/5 text-black rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-base mb-2">
                          <span className="text-black/60 font-semibold">
                            Quantity:
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.00000001"
                          min="0"
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-black/5 border border-black/5 text-black rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-base mb-2">
                          <span className="text-black/60 font-semibold">
                            Buy Date:
                          </span>
                        </label>
                        <input
                          type="date"
                          value={buyDate}
                          onChange={(e) => setBuyDate(e.target.value)}
                          className="w-full bg-black/5 border border-black/5 text-black rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddToPortfolio}
                      disabled={addingToPortfolio}
                      className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 text-base font-bold mt-6 rounded-full transition-all shadow-xs cursor-pointer ${
                        addingToPortfolio ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {addingToPortfolio ? "Adding..." : "Add to Portfolio"}
                    </button>
                  </div>

                  {/* Investment Calculator Card */}
                  <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs h-fit">
                    <h3 className="text-xl font-bold mb-4 text-black border-b border-black/5 pb-2">
                      Investment Calculator
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-base mb-2">
                          <span className="text-black/60 font-semibold">
                            Investment Amount ($):
                          </span>
                        </label>
                        <input
                          className="w-full bg-black/5 border border-black/5 text-black rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                          type="number"
                          min="1"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="mt-6 space-y-3 text-base border-t border-black/5 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-black/45 font-semibold">
                          Coins You&apos;ll Get:
                        </span>
                        <span className="font-bold text-black text-lg">
                          {meta?.current_price
                            ? (amount / meta.current_price).toFixed(8)
                            : "--"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-black/45 font-semibold">
                          Estimated 1Y Value:
                        </span>
                        <span className="font-bold text-black text-lg">
                          {formatCurrency(estReturn)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-black/45 font-semibold">
                          Estimated Profit:
                        </span>
                        <span
                          className={`font-bold text-lg ${estProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {formatCurrency(estProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-black/45 font-semibold">
                          Annualized Return:
                        </span>
                        <span className="font-bold text-black text-lg">
                          {formatPct(riskVolatility.annualized_return)}
                        </span>
                      </div>
                      <p className="text-sm opacity-70 mt-4 text-black/40 italic">
                        *Crypto investments are highly volatile. Past
                        performance doesn&apos;t guarantee future results.
                      </p>
                    </div>
                  </div>

                  {/* Risk & Volatility */}
                  <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs h-fit">
                    <h3 className="text-xl font-bold mb-4 text-black border-b border-black/5 pb-2">
                      Risk & Volatility
                    </h3>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center text-base">
                        <span className="text-black/45 font-semibold">
                          Annualized Volatility:
                        </span>
                        <span className="font-bold text-black">
                          {formatPct(riskVolatility.annualized_volatility)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="text-black/45 font-semibold">
                          Annualized Return:
                        </span>
                        <span className="font-bold text-black">
                          {formatPct(riskVolatility.annualized_return)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="text-black/45 font-semibold">
                          Sharpe Ratio:
                        </span>
                        <span className="font-bold text-black">
                          {riskVolatility.sharpe_ratio?.toFixed(2) ?? "--"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#F5F5F5] border border-black/5 rounded-2xl h-64 p-2 mt-4">
                      {riskVolatility.returns?.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={riskVolatility.returns.slice(-100)}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                            />
                            <Line
                              type="monotone"
                              dataKey="returns"
                              stroke="#10b981"
                              strokeWidth={1.5}
                              dot={false}
                            />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: "#6b7280", fontSize: 9 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis
                              tick={{ fill: "#6b7280", fontSize: 10 }}
                              tickFormatter={(val) =>
                                (val * 100).toFixed(1) + "%"
                              }
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                              }}
                              formatter={(value) => [
                                (value * 100).toFixed(4) + "%",
                                "Daily Return",
                              ]}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <span className="text-black/40 text-sm flex items-center justify-center h-full font-medium">
                          No data
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="h-full flex flex-col gap-6">
                  {/* Price History Card */}
                  <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs h-fit">
                    <div className="flex justify-between items-center mb-4 border-b border-black/5 pb-2">
                      <h3 className="text-xl font-bold text-black">
                        Historical Price
                      </h3>
                      <div className="flex gap-2">
                        {["1M", "3M", "6M", "1Y"].map((period) => (
                          <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                              selectedPeriod === period
                                ? "bg-purple-600 text-white shadow-xs"
                                : "bg-black/5 text-black/60 hover:bg-black/10"
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#F5F5F5] border border-black/5 rounded-2xl h-64 p-2">
                      {priceHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={priceHistory.slice(
                              selectedPeriod === "1Y"
                                ? -365
                                : selectedPeriod === "6M"
                                  ? -180
                                  : selectedPeriod === "3M"
                                    ? -90
                                    : -30,
                            )}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                            />
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke="#06b6d4"
                              strokeWidth={2}
                              dot={false}
                            />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: "#6b7280", fontSize: 9 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis
                              domain={["auto", "auto"]}
                              tick={{ fill: "#6b7280", fontSize: 10 }}
                              tickFormatter={(val) => "$" + val.toFixed(2)}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                              }}
                              formatter={(value) => ["$" + value.toFixed(2), "Price"]}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <span className="text-black/40 text-sm flex items-center justify-center h-full font-medium">
                          No data
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Performance Heatmap */}
                  <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs h-fit">
                    <h3 className="text-xl font-bold mb-4 text-black border-b border-black/5 pb-2">
                      Performance Heatmap
                    </h3>
                    <div className="h-64">
                      <PerformanceHeatmap data={heatmap} />
                    </div>
                  </div>

                  {/* Monte Carlo Prediction */}
                  <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs h-fit">
                    <h3 className="text-xl font-bold mb-3 text-black border-b border-black/5 pb-2">
                      Monte Carlo Prediction (1 Year)
                    </h3>
                    <div className="space-y-3 mb-4 text-base">
                      <div className="flex justify-between items-center">
                        <span className="text-black/45 font-semibold">
                          Expected Price:
                        </span>
                        <span className="font-bold text-black">
                          {formatCurrency(monteCarlo.expected_price)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-black/45 font-semibold">
                          Probability of Gain:
                        </span>
                        <span className="font-bold text-black">
                          {formatPct(
                            (monteCarlo.probability_positive_return || 0) / 100,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-black/45 font-semibold">
                          Price Range (5%-95%):
                        </span>
                        <span className="font-bold text-black text-right">
                          {formatCurrency(
                            monteCarlo.lower_bound_5th_percentile,
                          )}{" "}
                          -{" "}
                          {formatCurrency(
                            monteCarlo.upper_bound_95th_percentile,
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#F5F5F5] border border-black/5 rounded-2xl h-80 p-2">
                      {monteCarlo.simulation_paths?.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={monteCarlo.historical_predicted || []}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                            />
                            <XAxis
                              dataKey="day"
                              tick={{ fill: "#6b7280", fontSize: 10 }}
                              label={{
                                value: "Trading Days",
                                position: "insideBottom",
                                offset: -5,
                                fill: "#6b7280",
                                fontSize: 11,
                              }}
                            />
                            <YAxis
                              tick={{ fill: "#6b7280", fontSize: 10 }}
                              tickFormatter={(val) => "$" + val.toFixed(2)}
                              label={{
                                value: "Price ($)",
                                angle: -90,
                                position: "insideLeft",
                                fill: "#6b7280",
                                fontSize: 11,
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                              }}
                              labelStyle={{ color: "#111827" }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: "11px" }}
                              iconType="line"
                            />

                            <Line
                              type="monotone"
                              dataKey="value"
                              data={monteCarlo.historical_predicted}
                              stroke="#8b5cf6"
                              strokeWidth={2}
                              dot={false}
                              name="Historical + Predicted"
                            />

                            {monteCarlo.simulation_paths?.map((sim, idx) => (
                              <Line
                                key={sim.name}
                                type="monotone"
                                dataKey="value"
                                data={sim.data}
                                stroke={
                                  idx === 0
                                    ? "#10b981"
                                    : idx === 1
                                      ? "#14b8a6"
                                      : idx === 2
                                        ? "#06b6d4"
                                        : "#3b82f6"
                                }
                                strokeWidth={1}
                                dot={false}
                                name={sim.name}
                                opacity={0.6}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <span className="text-black/40 text-sm flex items-center justify-center h-full font-medium">
                          No prediction data
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compare Cryptos Section - Full Width */}
              <div className="mt-8 bg-white border border-black/5 rounded-[1.5rem] p-8 shadow-xs">
                <h3 className="text-2xl font-bold mb-6 text-black tracking-tight">
                  Compare Cryptos
                </h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Crypto 1 Search */}
                  <div className="relative">
                    <label className="block text-base mb-2 text-black/60 font-semibold">
                      First Crypto
                    </label>
                    <input
                      type="text"
                      value={crypto1Query}
                      onChange={(e) => {
                        setCrypto1Query(e.target.value);
                        setSelectedCrypto1(null);
                      }}
                      onFocus={() =>
                        crypto1Suggestions.length > 0 &&
                        setShowCrypto1Dropdown(true)
                      }
                      placeholder="Type to search (e.g., Bitcoin, Ethereum, Solana)..."
                      className="w-full bg-black/5 border border-black/5 text-black p-4 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-black/40"
                    />
                    {showCrypto1Dropdown && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-black/10 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                        {crypto1Suggestions.length > 0 ? (
                          crypto1Suggestions.map((crypto) => (
                            <div
                              key={crypto.id}
                              onClick={() => {
                                setShowCrypto1Dropdown(false);
                                handleCrypto1Select(crypto);
                              }}
                              className="p-4 hover:bg-purple-50 hover:text-purple-700 cursor-pointer transition-colors border-b border-black/5 last:border-b-0 text-black"
                            >
                              <div className="font-semibold text-sm mb-1">
                                {crypto.name}
                              </div>
                              <div className="text-black/40 text-xs font-semibold">
                                Symbol: {crypto.symbol?.toUpperCase()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-black/40 text-sm font-medium">
                            No results found
                          </div>
                        )}
                      </div>
                    )}
                    {selectedCrypto1 && (
                      <div className="mt-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <div className="text-emerald-600 text-sm font-bold">
                          ✓ Selected: {selectedCrypto1.name}
                        </div>
                        <div className="text-black/40 text-xs mt-1 font-semibold">
                          Symbol: {selectedCrypto1.symbol?.toUpperCase()}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-black/40 mt-2 italic font-semibold">
                      Type any letter to search
                    </p>
                  </div>

                  {/* Crypto 2 Search */}
                  <div className="relative">
                    <label className="block text-base mb-2 text-black/60 font-semibold">
                      Second Crypto
                    </label>
                    <input
                      type="text"
                      value={crypto2Query}
                      onChange={(e) => {
                        setCrypto2Query(e.target.value);
                        setSelectedCrypto2(null);
                      }}
                      onFocus={() =>
                        crypto2Suggestions.length > 0 &&
                        setShowCrypto2Dropdown(true)
                      }
                      placeholder="Type to search (e.g., Bitcoin, Ethereum, Solana)..."
                      className="w-full bg-black/5 border border-black/5 text-black p-4 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-black/40"
                    />
                    {showCrypto2Dropdown && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-black/10 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                        {crypto2Suggestions.length > 0 ? (
                          crypto2Suggestions.map((crypto) => (
                            <div
                              key={crypto.id}
                              onClick={() => {
                                setShowCrypto2Dropdown(false);
                                handleCrypto2Select(crypto);
                              }}
                              className="p-4 hover:bg-purple-50 hover:text-purple-700 cursor-pointer transition-colors border-b border-black/5 last:border-b-0 text-black"
                            >
                              <div className="font-semibold text-sm mb-1">
                                {crypto.name}
                              </div>
                              <div className="text-black/40 text-xs font-semibold">
                                Symbol: {crypto.symbol?.toUpperCase()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-black/40 text-sm font-medium">
                            No results found
                          </div>
                        )}
                      </div>
                    )}
                    {selectedCrypto2 && (
                      <div className="mt-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <div className="text-emerald-600 text-sm font-bold">
                          ✓ Selected: {selectedCrypto2.name}
                        </div>
                        <div className="text-black/40 text-xs mt-1 font-semibold">
                          Symbol: {selectedCrypto2.symbol?.toUpperCase()}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-black/40 mt-2 italic font-semibold">
                      Type any letter to search
                    </p>
                  </div>
                </div>

                {/* Compare Button */}
                {selectedCrypto1 && selectedCrypto2 && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowComparison(true)}
                      className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-full text-base font-bold transition-all transform hover:scale-[1.02] shadow-xs cursor-pointer"
                    >
                      Compare
                    </button>
                    <p className="text-black/40 text-sm mt-3 font-semibold">
                      Click to generate comparison
                    </p>
                  </div>
                )}

                {!selectedCrypto1 && !selectedCrypto2 && (
                  <p className="text-center text-black/40 text-base font-medium">
                    Search and select two cryptocurrencies to compare their
                    performance metrics
                  </p>
                )}
              </div>

              {showComparison && crypto1Data && crypto2Data && (
                <div className="mt-8 bg-white border border-black/5 rounded-[1.5rem] p-8 shadow-xs">
                  <h3 className="text-2xl font-bold mb-6 text-black tracking-tight">
                    Crypto Comparison
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#F5F5F5] border border-black/5 rounded-2xl p-6">
                      <h4 className="text-xl font-bold text-black mb-4 tracking-tight">
                        {crypto1Data.meta?.name || selectedCrypto1.name}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-base">
                          <span className="font-semibold text-black/45">
                            Symbol:
                          </span>
                          <span className="text-black font-semibold uppercase">
                            {crypto1Data.meta?.symbol || selectedCrypto1.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-base">
                          <span className="font-semibold text-black/45">
                            Current Price:
                          </span>
                          <span className="text-black font-semibold">
                            {formatCurrency(crypto1Data.meta?.current_price)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-base">
                          <span className="font-semibold text-black/45">
                            Market Cap:
                          </span>
                          <span className="text-black font-semibold">
                            {formatLargeCurrency(crypto1Data.meta?.market_cap)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-base">
                          <span className="font-semibold text-black/45">
                            Market Cap Rank:
                          </span>
                          <span className="text-black font-semibold">
                            #{crypto1Data.meta?.market_cap_rank}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#F5F5F5] border border-black/5 rounded-2xl p-6">
                      <h4 className="text-xl font-bold text-black mb-4 tracking-tight">
                        {crypto2Data.meta?.name || selectedCrypto2.name}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-base">
                          <span className="font-semibold text-black/45">
                            Symbol:
                          </span>
                          <span className="text-black font-semibold uppercase">
                            {crypto2Data.meta?.symbol || selectedCrypto2.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-base">
                          <span className="font-semibold text-black/45">
                            Current Price:
                          </span>
                          <span className="text-black font-semibold">
                            {formatCurrency(crypto2Data.meta?.current_price)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-base">
                          <span className="font-semibold text-black/45">
                            Market Cap:
                          </span>
                          <span className="text-black font-semibold">
                            {formatLargeCurrency(crypto2Data.meta?.market_cap)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-base">
                          <span className="font-semibold text-black/45">
                            Market Cap Rank:
                          </span>
                          <span className="text-black font-semibold">
                            #{crypto2Data.meta?.market_cap_rank}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-6 bg-[#F5F5F5] border border-black/5 rounded-2xl">
                    <h4 className="text-xl font-bold text-black mb-4 tracking-tight">
                      AI Comparison Analysis
                    </h4>
                    <p className="text-black/85 text-base leading-relaxed">
                      Based on the comparison between{" "}
                      {crypto1Data.meta?.name || selectedCrypto1.name} and{" "}
                      {crypto2Data.meta?.name || selectedCrypto2.name},
                      {crypto1Data.meta?.market_cap >
                      crypto2Data.meta?.market_cap
                        ? ` ${crypto1Data.meta?.name || selectedCrypto1.name} has a higher market capitalization (${formatLargeCurrency(crypto1Data.meta?.market_cap)}) compared to ${crypto2Data.meta?.name || selectedCrypto2.name} (${formatLargeCurrency(crypto2Data.meta?.market_cap)}). `
                        : ` ${crypto2Data.meta?.name || selectedCrypto2.name} has a higher market capitalization (${formatLargeCurrency(crypto2Data.meta?.market_cap)}) compared to ${crypto1Data.meta?.name || selectedCrypto1.name} (${formatLargeCurrency(crypto1Data.meta?.market_cap)}). `}
                      {crypto1Data.meta?.current_price >
                      crypto2Data.meta?.current_price
                        ? `${crypto1Data.meta?.name || selectedCrypto1.name} is currently trading at a higher price (${formatCurrency(crypto1Data.meta?.current_price)}) than ${crypto2Data.meta?.name || selectedCrypto2.name} (${formatCurrency(crypto2Data.meta?.current_price)}). `
                        : `${crypto2Data.meta?.name || selectedCrypto2.name} is currently trading at a higher price (${formatCurrency(crypto2Data.meta?.current_price)}) than ${crypto1Data.meta?.name || selectedCrypto1.name} (${formatCurrency(crypto1Data.meta?.current_price)}). `}
                      Consider your investment goals, risk tolerance, and
                      conduct further research before making investment
                      decisions. Cryptocurrency investments are highly volatile
                      and should not be considered as financial advice.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
