"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useUser from "@/lib/authClient";
import StockAIDostModal from "../../components/StockAIDostModal";
import StockAIReportModal from "../../components/StockAIReportModal";
import Chatbot from "../../components/Chatbot";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  ComposedChart,
  Legend,
} from "recharts";

// Utility functions
function formatPct(val) {
  return isNaN(val) ? "--" : (val * 100).toFixed(2) + "%";
}
function formatRs(val) {
  return isNaN(val) ? "--" : "₹" + Number(val).toLocaleString("en-IN");
}

// Custom Heatmap Component using Bar Chart (copied from MF page design)
function PerformanceHeatmap({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No heatmap data available
      </div>
    );
  }

  // Format data for bar chart - take last 12 months
  const chartData = data.slice(-12).map((item) => ({
    month: `${item.month}/${item.year}`,
    value: item.value,
    displayValue: item.value.toFixed(4),
  }));

  const getColor = (value) => {
    if (value > 0.15) return "#eab308";
    if (value > 0.05) return "#84cc16";
    if (value > 0) return "#10b981";
    if (value > -0.05) return "#6366f1";
    return "#8b5cf6";
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
            tickFormatter={(val) => val.toFixed(4)}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
            formatter={(value) => [value.toFixed(4), "Monthly Return"]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-end gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#8b5cf6] rounded"></div>
          <span className="text-gray-600">Negative</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#6366f1] rounded"></div>
          <span className="text-gray-600">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#10b981] rounded"></div>
          <span className="text-gray-600">Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#eab308] rounded"></div>
          <span className="text-gray-600">High</span>
        </div>
      </div>
    </div>
  );
}

export default function StockDetailsPage() {
  const { symbol } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [riskVolatility, setRiskVolatility] = useState({});
  const [monteCarlo, setMonteCarlo] = useState({});
  const [amount, setAmount] = useState(10000);
  const [years, setYears] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState("1M");

  // Compare stocks state
  const [stock1Query, setStock1Query] = useState("");
  const [stock2Query, setStock2Query] = useState("");
  const [stock1Suggestions, setStock1Suggestions] = useState([]);
  const [stock2Suggestions, setStock2Suggestions] = useState([]);
  const [showStock1Dropdown, setShowStock1Dropdown] = useState(false);
  const [showStock2Dropdown, setShowStock2Dropdown] = useState(false);
  const [selectedStock1, setSelectedStock1] = useState(null);
  const [selectedStock2, setSelectedStock2] = useState(null);
  const [stock1Data, setStock1Data] = useState(null);
  const [stock2Data, setStock2Data] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  // AI Modals
  const [showAIDost, setShowAIDost] = useState(false);
  const [showAIReport, setShowAIReport] = useState(false);
  const [addingToPortfolio, setAddingToPortfolio] = useState(false);

  // Portfolio form state
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [buyDate, setBuyDate] = useState("");

  const { user, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    setLoading(true);

    (async () => {
      try {
        const endpoints = {
          profile: `/api/backend/stock/profile/${symbol}`,
          history: `/api/backend/stock/history/${symbol}`,
          heatmap: `/api/backend/stock/performance-heatmap/${symbol}`,
          risk: `/api/backend/stock/risk-volatility/${symbol}`,
          montecarlo: `/api/backend/stock/monte-carlo-prediction/${symbol}`,
        };

        const results = {};

        for (const [key, url] of Object.entries(endpoints)) {
          try {
            const res = await fetch(url);
            const text = await res.text();
            // Try to parse JSON, fallback to null and log raw body for debugging
            try {
              results[key] = res.ok ? JSON.parse(text) : null;
            } catch (parseErr) {
              console.error(
                `Non-JSON response from ${url}:`,
                text.slice(0, 1000),
              );
              results[key] = null;
            }
          } catch (fetchErr) {
            console.error(`Network error fetching ${url}:`, fetchErr);
            results[key] = null;
          }
        }

        setProfile(results.profile || null);
        setHistory(results.history || []);
        setHeatmap(results.heatmap || []);
        setRiskVolatility(results.risk || {});
        setMonteCarlo(results.montecarlo || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [symbol]);

  // Debounced search for stock 1
  useEffect(() => {
    if (stock1Query.length < 1) return setStock1Suggestions([]);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/backend/stock/search-stocks?q=${encodeURIComponent(stock1Query)}`,
        );
        const data = await res.json();
        setStock1Suggestions(data || []);
        setShowStock1Dropdown(true); // Always show dropdown when searching
      } catch (e) {
        console.error("Error fetching stock suggestions:", e);
        setStock1Suggestions([]);
        setShowStock1Dropdown(true); // Show dropdown even on error
      }
    }, 300);
    return () => clearTimeout(id);
  }, [stock1Query]);

  // Debounced search for stock 2
  useEffect(() => {
    if (stock2Query.length < 1) return setStock2Suggestions([]);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/backend/stock/search-stocks?q=${encodeURIComponent(stock2Query)}`,
        );
        const data = await res.json();
        setStock2Suggestions(data || []);
        setShowStock2Dropdown(true); // Always show dropdown when searching
      } catch (e) {
        console.error("Error fetching stock suggestions:", e);
        setStock2Suggestions([]);
        setShowStock2Dropdown(true); // Show dropdown even on error
      }
    }, 300);
    return () => clearTimeout(id);
  }, [stock2Query]);

  // Fetch data for selected stock 1
  useEffect(() => {
    if (!selectedStock1) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/backend/stock/profile/${selectedStock1.symbol}`,
        );
        const data = await res.json();
        setStock1Data({ profile: data });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedStock1]);

  // Fetch data for selected stock 2
  useEffect(() => {
    if (!selectedStock2) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/backend/stock/profile/${selectedStock2.symbol}`,
        );
        const data = await res.json();
        setStock2Data({ profile: data });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedStock2]);

  const handleStock1Select = (s) => {
    setSelectedStock1(s);
    setStock1Query(s.name || s.symbol);
  };
  const handleStock2Select = (s) => {
    setSelectedStock2(s);
    setStock2Query(s.name || s.symbol);
  };

  const handleAddToPortfolio = async () => {
    if (!isSignedIn || !user) {
      alert("Please sign in to add items to your portfolio");
      return;
    }

    const finalBuyPrice = buyPrice || profile?.regularMarketPrice;
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
        name: profile?.longName || symbol,
        asset_type: "stock",
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
          alert(data.detail || "Stock already in portfolio");
        } else {
          throw new Error(data.detail || "Failed to add to portfolio");
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
  const estReturn =
    amount *
    Math.pow(1 + (riskVolatility.annualized_return || 0), Number(years || 1));
  const estProfit = estReturn - amount;

  return (
    <>
      <section className="min-h-screen pt-28 pb-16 px-4 md:px-8 bg-[#F5F5F5] text-black">
        <div className="max-w-7xl mx-auto grid gap-8">
          {loading ? (
            <div className="flex justify-center items-center min-h-[60vh]">
              <span className="animate-spin border-4 border-black border-t-transparent rounded-full w-10 h-10"></span>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-medium text-black text-center tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                  Stock Analytics.
                </h1>
              </div>

              <div className="mb-6">
                <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs max-w-xl mx-auto">
                  <h2 className="text-2xl font-bold text-black text-center mb-4 tracking-tight">
                    {profile?.longName || profile?.companyName || symbol}
                  </h2>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setShowAIDost(true)}
                      className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full font-semibold transition-all transform hover:scale-[1.02] shadow-xs cursor-pointer flex items-center gap-2 text-sm"
                    >
                      AI Dost
                    </button>
                    <button
                      onClick={() => setShowAIReport(true)}
                      className="bg-black/5 hover:bg-black/10 text-black px-6 py-2.5 rounded-full font-semibold transition-all flex items-center gap-2 text-sm cursor-pointer border border-black/10"
                    >
                      AI Report
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 items-start">
                <div className="flex flex-col gap-6">
                  <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs h-fit">
                    <h3 className="text-xl font-bold mb-4 text-black border-b border-black/5 pb-2">
                      {profile?.longName || symbol}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          Industry:
                        </span>
                        <span className="text-black font-semibold">
                          {profile?.industry || "Not Available"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          Sector:
                        </span>
                        <span className="text-black font-semibold">
                          {profile?.sector || "Not Available"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          Market Cap:
                        </span>
                        <span className="text-black font-semibold">
                          {formatRs(profile?.market_cap)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          Symbol:
                        </span>
                        <span className="text-black font-semibold">
                          {symbol}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4 mt-6 border-t border-black/5 pt-4">
                      <div>
                        <label className="block text-base mb-2">
                          <span className="text-black/60 font-semibold">
                            Buy Price (₹):
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={
                            profile?.regularMarketPrice
                              ? `Current: ₹${Number(profile.regularMarketPrice).toFixed(2)}`
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
                          step="0.01"
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
                          value={
                            buyDate || new Date().toISOString().split("T")[0]
                          }
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

                  <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs h-fit">
                    <h3 className="text-xl font-bold mb-4 text-black border-b border-black/5 pb-2">
                      Calculate Your Returns
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-base mb-2">
                          <span className="text-black/60 font-semibold">
                            Investment Amount (₹):
                          </span>
                        </label>
                        <input
                          className="w-full bg-black/5 border border-black/5 text-black rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                          type="number"
                          min="100"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-base mb-2">
                          <span className="text-black/60 font-semibold">
                            Duration (Years):
                          </span>
                        </label>
                        <input
                          className="w-full bg-black/5 border border-black/5 text-black rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                          type="number"
                          min="1"
                          value={years}
                          onChange={(e) => setYears(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="mt-6 space-y-3 text-base border-t border-black/5 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-black/45 font-semibold">
                          Estimated Total Value:
                        </span>
                        <span className="font-bold text-black text-lg">
                          {formatRs(estReturn)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-black/45 font-semibold">
                          Estimated Profit:
                        </span>
                        <span className="font-bold text-emerald-600 text-lg">
                          {formatRs(estProfit)}
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
                      <p className="text-sm mt-4 text-black/40 italic">
                        *Based on historical annualized return, actual returns
                        may vary.
                      </p>
                    </div>
                  </div>

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

                <div className="flex flex-col gap-6">
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
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${selectedPeriod === period ? "bg-purple-600 text-white shadow-xs" : "bg-black/5 text-black/60 hover:bg-black/10"}`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#F5F5F5] border border-black/5 rounded-2xl h-64 p-2">
                      {history.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={history.slice(
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
                              dataKey="close"
                              stroke="#8b5cf6"
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
                              tickFormatter={(val) => "₹" + val.toFixed(2)}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                              }}
                              formatter={(value) => [
                                "₹" + value.toFixed(2),
                                "Price",
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

                  <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs h-fit">
                    <h3 className="text-xl font-bold mb-4 text-black border-b border-black/5 pb-2">
                      Moving Averages (20 & 50 Days)
                    </h3>
                    <div className="bg-[#F5F5F5] border border-black/5 rounded-2xl h-64 p-2">
                      {history.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={history.slice(-30)}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                            />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: "#6b7280", fontSize: 9 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} />
                            <Tooltip
                              contentStyle={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: "11px" }} />
                            <Bar
                              dataKey="ma20"
                              barSize={10}
                              fill="#10b981"
                              name="MA 20"
                            />
                            <Bar
                              dataKey="ma50"
                              barSize={10}
                              fill="#8b5cf6"
                              name="MA 50"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      ) : (
                        <span className="text-black/40 text-sm flex items-center justify-center h-full font-medium">
                          No data
                        </span>
                      )}
                    </div>
                  </div>

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
                          {formatRs(monteCarlo.expected_price)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-black/45 font-semibold">
                          Probability of Positive Return:
                        </span>
                        <span className="font-bold text-black">
                          {formatPct(
                            monteCarlo.probability_positive_return / 100,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-black/45 font-semibold">
                          Range:
                        </span>
                        <span className="font-bold text-black">
                          {monteCarlo.lower_bound_5th_percentile?.toFixed(2)} -{" "}
                          {monteCarlo.upper_bound_95th_percentile?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#F5F5F5] border border-black/5 rounded-2xl h-64 p-2">
                      {monteCarlo.expected_price ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={[
                              {
                                label: "Last Price",
                                value: monteCarlo.last_price,
                              },
                              {
                                label: "Expected",
                                value: monteCarlo.expected_price,
                              },
                              {
                                label: "5th %",
                                value: monteCarlo.lower_bound_5th_percentile,
                              },
                              {
                                label: "95th %",
                                value: monteCarlo.upper_bound_95th_percentile,
                              },
                            ]}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                            />
                            <XAxis
                              dataKey="label"
                              tick={{ fill: "#6b7280", fontSize: 10 }}
                            />
                            <YAxis
                              tick={{ fill: "#6b7280", fontSize: 10 }}
                              tickFormatter={(val) => "₹" + val.toFixed(0)}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                              }}
                              formatter={(value) => [
                                "₹" + value.toFixed(2),
                                "Price",
                              ]}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#8b5cf6"
                              strokeWidth={3}
                              dot={{ fill: "#8b5cf6", r: 5 }}
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
              </div>

              <div className="mt-8 bg-white border border-black/5 rounded-[1.5rem] p-8 shadow-xs">
                <h3 className="text-2xl font-bold mb-6 text-black tracking-tight">
                  Compare Stocks
                </h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="relative">
                    <label className="block text-base mb-2 text-black/60 font-semibold">
                      First Stock
                    </label>
                    <input
                      type="text"
                      value={stock1Query}
                      onChange={(e) => {
                        setStock1Query(e.target.value);
                        setSelectedStock1(null);
                      }}
                      onFocus={() =>
                        stock1Query.length >= 1 && setShowStock1Dropdown(true)
                      }
                      placeholder="Type to search (e.g., TCS, INFY, RELIANCE)..."
                      className="w-full bg-black/5 border border-black/5 text-black p-4 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-black/40 font-medium"
                    />
                    {showStock1Dropdown && stock1Suggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-black/10 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                        {stock1Suggestions.map((s) => (
                          <div
                            key={s.symbol || s.code}
                            onClick={() => {
                              setShowStock1Dropdown(false);
                              handleStock1Select(s);
                            }}
                            className="p-4 hover:bg-purple-50 cursor-pointer transition-colors border-b border-black/5 last:border-b-0"
                          >
                            <div className="text-black font-semibold text-sm mb-1">
                              {s.name || s.longName || s.symbol}
                            </div>
                            <div className="text-black/40 text-xs font-medium">
                              Symbol: {s.symbol || s.code}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedStock1 && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-xs">
                        <div className="text-emerald-700 text-sm font-semibold">
                          ✓ Selected:{" "}
                          {selectedStock1.name || selectedStock1.symbol}
                        </div>
                        <div className="text-black/45 text-xs font-semibold mt-1">
                          Symbol: {selectedStock1.symbol || selectedStock1.code}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-black/40 mt-2 font-medium">
                      Type any letter to search
                    </p>
                  </div>

                  <div className="relative">
                    <label className="block text-base mb-2 text-black/60 font-semibold">
                      Second Stock
                    </label>
                    <input
                      type="text"
                      value={stock2Query}
                      onChange={(e) => {
                        setStock2Query(e.target.value);
                        setSelectedStock2(null);
                      }}
                      onFocus={() =>
                        stock2Query.length >= 1 && setShowStock2Dropdown(true)
                      }
                      placeholder="Type to search (e.g., TCS, INFY, RELIANCE)..."
                      className="w-full bg-black/5 border border-black/5 text-black p-4 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-black/40 font-medium"
                    />
                    {showStock2Dropdown && stock2Suggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-black/10 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                        {stock2Suggestions.map((s) => (
                          <div
                            key={s.symbol || s.code}
                            onClick={() => {
                              setShowStock2Dropdown(false);
                              handleStock2Select(s);
                            }}
                            className="p-4 hover:bg-purple-50 cursor-pointer transition-colors border-b border-black/5 last:border-b-0"
                          >
                            <div className="text-black font-semibold text-sm mb-1">
                              {s.name || s.longName || s.symbol}
                            </div>
                            <div className="text-black/40 text-xs font-medium">
                              Symbol: {s.symbol || s.code}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedStock2 && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-xs">
                        <div className="text-emerald-700 text-sm font-semibold">
                          ✓ Selected:{" "}
                          {selectedStock2.name || selectedStock2.symbol}
                        </div>
                        <div className="text-black/45 text-xs font-semibold mt-1">
                          Symbol: {selectedStock2.symbol || selectedStock2.code}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-black/40 mt-2 font-medium">
                      Type any letter to search
                    </p>
                  </div>
                </div>

                {selectedStock1 && selectedStock2 && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowComparison(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full text-base font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Compare Stocks
                    </button>
                    <p className="text-black/40 text-xs font-semibold mt-3">
                      Click to generate comparison report
                    </p>
                  </div>
                )}

                {showComparison && stock1Data && stock2Data && (
                  <div className="mt-8 bg-white border border-black/5 rounded-[1.5rem] p-8 shadow-xs">
                    <h3 className="text-2xl font-bold mb-6 text-black tracking-tight">
                      Stock Comparison
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-[#F5F5F5] rounded-2xl p-6">
                        <h4 className="text-xl font-bold text-black mb-4 tracking-tight">
                          {stock1Data.profile?.longName ||
                            stock1Data.profile?.companyName ||
                            selectedStock1.name}
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Industry:
                            </span>
                            <span className="text-black font-semibold">
                              {stock1Data.profile?.industry || "Not Available"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Sector:
                            </span>
                            <span className="text-black font-semibold">
                              {stock1Data.profile?.sector || "Not Available"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Market Cap:
                            </span>
                            <span className="text-black font-semibold">
                              {formatRs(stock1Data.profile?.market_cap)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Symbol:
                            </span>
                            <span className="text-black font-semibold">
                              {selectedStock1.symbol}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#F5F5F5] rounded-2xl p-6">
                        <h4 className="text-xl font-bold text-black mb-4 tracking-tight">
                          {stock2Data.profile?.longName ||
                            stock2Data.profile?.companyName ||
                            selectedStock2.name}
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Industry:
                            </span>
                            <span className="text-black font-semibold">
                              {stock2Data.profile?.industry || "Not Available"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Sector:
                            </span>
                            <span className="text-black font-semibold">
                              {stock2Data.profile?.sector || "Not Available"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Market Cap:
                            </span>
                            <span className="text-black font-semibold">
                              {formatRs(stock2Data.profile?.market_cap)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Symbol:
                            </span>
                            <span className="text-black font-semibold">
                              {selectedStock2.symbol}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-6 bg-purple-50 border border-purple-100 rounded-2xl">
                      <h4 className="text-xl font-bold text-purple-950 mb-4 tracking-tight">
                        AI Comparison Analysis
                      </h4>
                      <p className="text-purple-900 text-base leading-relaxed">
                        Based on the comparison between{" "}
                        {stock1Data.profile?.longName || selectedStock1.name}{" "}
                        and{" "}
                        {stock2Data.profile?.longName || selectedStock2.name},
                        both stocks operate in the{" "}
                        {stock1Data.profile?.sector ===
                        stock2Data.profile?.sector
                          ? stock1Data.profile?.sector
                          : `${stock1Data.profile?.sector} and ${stock2Data.profile?.sector} sectors respectively`}
                        .
                        {stock1Data.profile?.marketCap &&
                        stock2Data.profile?.marketCap
                          ? `${stock1Data.profile.longName || selectedStock1.name} has a market capitalization of ${formatRs(stock1Data.profile.marketCap)} compared to ${formatRs(stock2Data.profile.marketCap)} for ${stock2Data.profile.longName || selectedStock2.name}. `
                          : ""}
                        Consider your investment goals, risk tolerance, and
                        conduct further research before making investment
                        decisions. This analysis is for informational purposes
                        only and should not be considered as financial advice.
                      </p>
                    </div>
                  </div>
                )}

                {!selectedStock1 && !selectedStock2 && (
                  <p className="text-center text-black/40 text-base font-semibold">
                    Search and select two stocks to compare their performance
                    metrics
                  </p>
                )}
              </div>

              <StockAIDostModal
                isOpen={showAIDost}
                onClose={() => setShowAIDost(false)}
                stockData={{
                  meta: profile,
                  navHistory: history,
                  riskVolatility,
                  monteCarlo,
                }}
              />
              <StockAIReportModal
                isOpen={showAIReport}
                onClose={() => setShowAIReport(false)}
                stockData={{
                  meta: profile,
                  navHistory: history,
                  riskVolatility,
                  monteCarlo,
                }}
              />

              {/* Chatbot */}
              <Chatbot currentPage="stock-detail" selectedItem={symbol} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
