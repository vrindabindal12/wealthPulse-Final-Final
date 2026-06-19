//

"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useUser from "@/lib/authClient";
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
import AIDostModal from "../../components/AIDostModal";
import AIReportModal from "../../components/AIReportModal";
import Chatbot from "../../components/Chatbot";

// Utility functions
function formatPct(val) {
  return isNaN(val) ? "--" : (val * 100).toFixed(2) + "%";
}
function formatRs(val) {
  return isNaN(val) ? "--" : "₹" + Number(val).toLocaleString("en-IN");
}

// Custom Heatmap Component using Bar Chart
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
            tickFormatter={(val) => val.toFixed(4)}
            reversed={false}
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

      {/* Color Legend */}
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

export default function MFDetailsPage() {
  const { schemeCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [navHistory, setNavHistory] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [riskVolatility, setRiskVolatility] = useState({});
  const [monteCarlo, setMonteCarlo] = useState({});
  const [amount, setAmount] = useState(10000);
  const [years, setYears] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState("1M");

  // Compare funds state
  const [fund1Query, setFund1Query] = useState("");
  const [fund2Query, setFund2Query] = useState("");
  const [fund1Suggestions, setFund1Suggestions] = useState([]);
  const [fund2Suggestions, setFund2Suggestions] = useState([]);
  const [showFund1Dropdown, setShowFund1Dropdown] = useState(false);
  const [showFund2Dropdown, setShowFund2Dropdown] = useState(false);
  const [selectedFund1, setSelectedFund1] = useState(null);
  const [selectedFund2, setSelectedFund2] = useState(null);
  const [fund1Data, setFund1Data] = useState(null);
  const [fund2Data, setFund2Data] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  // AI Dost Modal state
  const [showAIDost, setShowAIDost] = useState(false);

  // AI Report Modal state
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

    const handleResponse = async (response, endpointName) => {
      if (!response.ok) {
        throw new Error(
          `${endpointName} failed: ${response.status} ${response.statusText}`,
        );
      }
      return response.json();
    };

    Promise.all([
      fetch(
        `/api/backend/mutual/scheme-details/${schemeCode}`,
      ).then((r) => handleResponse(r, "scheme-details")),
      fetch(
        `/api/backend/mutual/historical-nav/${schemeCode}`,
      ).then((r) => handleResponse(r, "historical-nav")),
      fetch(
        `/api/backend/mutual/performance-heatmap/${schemeCode}`,
      ).then((r) => handleResponse(r, "performance-heatmap")),
      fetch(
        `/api/backend/mutual/risk-volatility/${schemeCode}`,
      ).then((r) => handleResponse(r, "risk-volatility")),
      fetch(
        `/api/backend/mutual/monte-carlo-prediction/${schemeCode}`,
      ).then((r) => handleResponse(r, "monte-carlo-prediction")),
    ])
      .then(([meta, navs, heat, risk, mc]) => {
        setMeta(meta || {});
        setNavHistory(Array.isArray(navs) ? navs : []);
        setHeatmap(Array.isArray(heat) ? heat : []);
        setRiskVolatility(risk || {});
        setMonteCarlo(mc || {});
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading MF details:", error);
        // Set empty defaults so the page doesn't crash
        setMeta({});
        setNavHistory([]);
        setHeatmap([]);
        setRiskVolatility({});
        setMonteCarlo({});
        setLoading(false);
      });
  }, [schemeCode]);

  // Debounced search for fund 1
  useEffect(() => {
    if (fund1Query.length < 1) {
      setFund1Suggestions([]);
      setShowFund1Dropdown(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/backend/mutual/schemes?search=${encodeURIComponent(fund1Query)}`,
        );
        const data = await response.json();
        const suggestions = Object.entries(data)
          .map(([code, name]) => ({ code, name }))
          .slice(0, 10);
        setFund1Suggestions(suggestions);
        setShowFund1Dropdown(true); // Always show dropdown when searching
      } catch (error) {
        console.error("Error fetching fund suggestions:", error);
        setFund1Suggestions([]);
        setShowFund1Dropdown(true); // Show dropdown even on error so user sees "No results found"
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fund1Query]);

  // Debounced search for fund 2
  useEffect(() => {
    if (fund2Query.length < 1) {
      setFund2Suggestions([]);
      setShowFund2Dropdown(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/backend/mutual/schemes?search=${encodeURIComponent(fund2Query)}`,
        );
        const data = await response.json();
        const suggestions = Object.entries(data)
          .map(([code, name]) => ({ code, name }))
          .slice(0, 10);
        setFund2Suggestions(suggestions);
        setShowFund2Dropdown(true); // Always show dropdown when searching
      } catch (error) {
        console.error("Error fetching fund suggestions:", error);
        setFund2Suggestions([]);
        setShowFund2Dropdown(true); // Show dropdown even on error so user sees "No results found"
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fund2Query]);

  // Fetch data for selected fund 1
  useEffect(() => {
    if (!selectedFund1) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/backend/mutual/scheme-details/${selectedFund1.code}`,
        );
        const data = await res.json();
        setFund1Data({ meta: data });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedFund1]);

  // Fetch data for selected fund 2
  useEffect(() => {
    if (!selectedFund2) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/backend/mutual/scheme-details/${selectedFund2.code}`,
        );
        const data = await res.json();
        setFund2Data({ meta: data });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedFund2]);

  // Handle fund selection
  const handleFund1Select = (fund) => {
    setSelectedFund1(fund);
    setFund1Query(fund.name);
    setShowFund1Dropdown(false);
  };

  const handleFund2Select = (fund) => {
    setSelectedFund2(fund);
    setFund2Query(fund.name);
    setShowFund2Dropdown(false);
  };

  const handleAddToPortfolio = async () => {
    if (!isSignedIn || !user) {
      alert("Please sign in to add items to your portfolio");
      return;
    }

    const latestNAV =
      navHistory && navHistory.length > 0
        ? navHistory[navHistory.length - 1]?.nav
        : null;
    const finalBuyPrice = buyPrice || latestNAV;

    if (!finalBuyPrice || finalBuyPrice <= 0) {
      alert("Please enter a valid buy price (NAV)");
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
        symbol: schemeCode,
        name: meta?.scheme_name || schemeCode,
        asset_type: "mutualfund",
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
          alert(data.detail || "Fund already in portfolio");
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

  // Calculate future returns
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
              {/* Scheme Name Heading */}
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-medium text-black text-center tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                  Mutual Fund Analytics.
                </h1>
              </div>

              {/* Fund Name Display */}
              <div className="mb-6">
                <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs max-w-xl mx-auto">
                  <h2 className="text-2xl font-bold text-black text-center mb-4 tracking-tight">
                    {meta?.scheme_name || `Scheme Code: ${schemeCode}`}
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

              {/* Main Grid - 2 columns with equal heights */}
              <div className="grid lg:grid-cols-2 gap-6 items-start">
                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-6">
                  {/* Fund Meta Card */}
                  <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs h-fit">
                    <h3 className="text-xl font-bold mb-4 text-black border-b border-black/5 pb-2">
                      {meta?.scheme_name || `Fund Details`}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          fund house:
                        </span>
                        <span className="text-black font-semibold">
                          {meta?.fund_house || "Not Available"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          scheme type:
                        </span>
                        <span className="text-black font-semibold">
                          {meta?.scheme_type || "Not Available"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          scheme category:
                        </span>
                        <span className="text-black font-semibold">
                          {meta?.scheme_category || "Not Available"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          scheme code:
                        </span>
                        <span className="text-black font-semibold">
                          {schemeCode}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="font-semibold text-black/45">
                          scheme name:
                        </span>
                        <span className="text-black font-semibold text-right">
                          {meta?.scheme_name || "Not Available"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4 mt-6 border-t border-black/5 pt-4">
                      <div>
                        <label className="block text-base mb-2">
                          <span className="text-black/60 font-semibold">
                            Buy Price / NAV (₹):
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={
                            navHistory && navHistory.length > 0
                              ? `Latest NAV: ₹${Number(navHistory[navHistory.length - 1]?.nav).toFixed(2)}`
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
                            Units/Quantity:
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

                  {/* Return Calculator Card */}
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
                <div className="flex flex-col gap-6">
                  {/* NAV History Card */}
                  <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs h-fit">
                    <div className="flex justify-between items-center mb-4 border-b border-black/5 pb-2">
                      <h3 className="text-xl font-bold text-black">
                        Historical NAV
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
                      {navHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={navHistory.slice(
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
                              dataKey="nav"
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
                              formatter={(value) => ["₹" + value.toFixed(2), "NAV"]}
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
                          Expected NAV:
                        </span>
                        <span className="font-bold text-black">
                          {monteCarlo.expected_nav?.toFixed(2) ?? "--"}
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
                    <div className="bg-[#F5F5F5] border border-black/5 rounded-2xl h-80 p-2">
                      {monteCarlo.simulation_paths?.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={monteCarlo.historical_predicted}>
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
                              label={{
                                value: "NAV (₹)",
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
                              labelStyle={{ color: "#000000" }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: "11px" }}
                              iconType="line"
                            />

                            {/* Historical + Predicted (purple) */}
                            <Line
                              type="monotone"
                              dataKey="value"
                              data={monteCarlo.historical_predicted}
                              stroke="#8b5cf6"
                              strokeWidth={2}
                              dot={false}
                              name="Historical + Predicted"
                            />

                            {/* Simulation paths */}
                            {monteCarlo.simulation_paths?.map((sim, idx) => (
                              <Line
                                key={sim.name}
                                type="monotone"
                                dataKey="value"
                                data={sim.data}
                                stroke={
                                  idx === 0
                                    ? "#10b981" // green
                                    : idx === 1
                                      ? "#14b8a6" // teal
                                      : idx === 2
                                        ? "#06b6d4" // cyan
                                        : "#3b82f6" // blue
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
                          No data
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compare Funds Section - Full Width */}
              <div className="mt-8 bg-white border border-black/5 rounded-[1.5rem] p-8 shadow-xs">
                <h3 className="text-2xl font-bold mb-6 text-black tracking-tight">
                  Compare Funds
                </h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Fund 1 Search */}
                  <div className="relative">
                    <label className="block text-base mb-2 text-black/60 font-semibold">
                      First Fund
                    </label>
                    <input
                      type="text"
                      value={fund1Query}
                      onChange={(e) => {
                        setFund1Query(e.target.value);
                        setSelectedFund1(null);
                      }}
                      onFocus={() =>
                        fund1Query.length >= 1 && setShowFund1Dropdown(true)
                      }
                      placeholder="Type to search (e.g., SBI, HDFC, ICICI)..."
                      className="w-full bg-black/5 border border-black/5 text-black p-4 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-black/40"
                    />
                    {showFund1Dropdown && fund1Suggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-black/10 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                        {fund1Suggestions.map((fund) => (
                          <div
                            key={fund.code}
                            onClick={() => handleFund1Select(fund)}
                            className="p-4 hover:bg-black/5 cursor-pointer transition-colors border-b border-black/5 last:border-b-0"
                          >
                            <div className="text-black font-semibold text-sm mb-1">
                              {fund.name}
                            </div>
                            <div className="text-black/45 text-xs">
                              Code: {fund.code}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedFund1 && (
                      <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="text-emerald-700 text-sm font-semibold">
                          ✓ Selected: {selectedFund1.name}
                        </div>
                        <div className="text-black/45 text-xs mt-1">
                          Code: {selectedFund1.code}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-black/40 mt-2 italic">
                      Type any letter to search
                    </p>
                  </div>

                  {/* Fund 2 Search */}
                  <div className="relative">
                    <label className="block text-base mb-2 text-black/60 font-semibold">
                      Second Fund
                    </label>
                    <input
                      type="text"
                      value={fund2Query}
                      onChange={(e) => {
                        setFund2Query(e.target.value);
                        setSelectedFund2(null);
                      }}
                      onFocus={() =>
                        fund2Query.length >= 1 && setShowFund2Dropdown(true)
                      }
                      placeholder="Type to search (e.g., SBI, HDFC, ICICI)..."
                      className="w-full bg-black/5 border border-black/5 text-black p-4 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-black/40"
                    />
                    {showFund2Dropdown && fund2Suggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-black/10 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                        {fund2Suggestions.map((fund) => (
                          <div
                            key={fund.code}
                            onClick={() => handleFund2Select(fund)}
                            className="p-4 hover:bg-black/5 cursor-pointer transition-colors border-b border-black/5 last:border-b-0"
                          >
                            <div className="text-black font-semibold text-sm mb-1">
                              {fund.name}
                            </div>
                            <div className="text-black/45 text-xs">
                              Code: {fund.code}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedFund2 && (
                      <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="text-emerald-700 text-sm font-semibold">
                          ✓ Selected: {selectedFund2.name}
                        </div>
                        <div className="text-black/45 text-xs mt-1">
                          Code: {selectedFund2.code}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-black/40 mt-2 italic">
                      Type any letter to search
                    </p>
                  </div>
                </div>

                {/* Compare Button */}
                {selectedFund1 && selectedFund2 && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowComparison(true)}
                      className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-full text-base font-bold transition-all transform hover:scale-[1.02] shadow-xs cursor-pointer"
                    >
                      Compare Funds
                    </button>
                    <p className="text-black/40 text-sm mt-3">
                      Click to generate comparison report
                    </p>
                  </div>
                )}

                {showComparison && fund1Data && fund2Data && (
                  <div className="mt-8 bg-[#F5F5F5] border border-black/5 rounded-[1.5rem] p-8 shadow-xs">
                    <h3 className="text-2xl font-bold mb-6 text-black tracking-tight">
                      Fund Comparison
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-xs">
                        <h4 className="text-xl font-bold text-black mb-4">
                          {fund1Data.meta?.scheme_name || selectedFund1.name}
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Fund House:
                            </span>
                            <span className="text-black font-semibold">
                              {fund1Data.meta?.fund_house || "Not Available"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Scheme Type:
                            </span>
                            <span className="text-black font-semibold">
                              {fund1Data.meta?.scheme_type || "Not Available"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Scheme Category:
                            </span>
                            <span className="text-black font-semibold">
                              {fund1Data.meta?.scheme_category ||
                                "Not Available"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Code:
                            </span>
                            <span className="text-black font-semibold">
                              {selectedFund1.code}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-xs">
                        <h4 className="text-xl font-bold text-black mb-4">
                          {fund2Data.meta?.scheme_name || selectedFund2.name}
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Fund House:
                            </span>
                            <span className="text-black font-semibold">
                              {fund2Data.meta?.fund_house || "Not Available"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Scheme Type:
                            </span>
                            <span className="text-black font-semibold">
                              {fund2Data.meta?.scheme_type || "Not Available"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Scheme Category:
                            </span>
                            <span className="text-black font-semibold">
                              {fund2Data.meta?.scheme_category ||
                                "Not Available"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-black/45">
                              Code:
                            </span>
                            <span className="text-black font-semibold">
                              {selectedFund2.code}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-6 bg-white border border-black/5 rounded-2xl shadow-xs">
                      <h4 className="text-xl font-bold text-black mb-4">
                        AI Comparison Analysis
                      </h4>
                      <p className="text-black/70 text-base leading-relaxed">
                        Based on the comparison between{" "}
                        {fund1Data.meta?.scheme_name || selectedFund1.name} and{" "}
                        {fund2Data.meta?.scheme_name || selectedFund2.name},
                        both funds are managed by{" "}
                        {fund1Data.meta?.fund_house ===
                        fund2Data.meta?.fund_house
                          ? fund1Data.meta?.fund_house
                          : `${fund1Data.meta?.fund_house} and ${fund2Data.meta?.fund_house} respectively`}
                        .{" "}
                        {fund1Data.meta?.scheme_type ===
                        fund2Data.meta?.scheme_type
                          ? `Both funds are ${fund1Data.meta?.scheme_type} schemes`
                          : `${fund1Data.meta?.scheme_name || selectedFund1.name} is a ${fund1Data.meta?.scheme_type} scheme while ${fund2Data.meta?.scheme_name || selectedFund2.name} is a ${fund2Data.meta?.scheme_type} scheme`}
                        . Consider your investment goals, risk tolerance, and
                        conduct further research before making investment
                        decisions. This analysis is for informational purposes
                        only and should not be considered as financial advice.
                      </p>
                    </div>
                  </div>
                )}

                {!selectedFund1 && !selectedFund2 && (
                  <p className="text-center text-black/40 text-base font-medium">
                    Search and select two funds to compare their performance
                    metrics
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* AI Dost Modal */}
        <AIDostModal
          isOpen={showAIDost}
          onClose={() => setShowAIDost(false)}
          fundData={{
            meta,
            navHistory,
            riskVolatility,
            monteCarlo,
          }}
        />

        {/* AI Report Modal */}
        <AIReportModal
          isOpen={showAIReport}
          onClose={() => setShowAIReport(false)}
          fundData={{
            meta,
            navHistory,
            riskVolatility,
            monteCarlo,
          }}
        />

        {/* Chatbot */}
        <Chatbot currentPage="fund-detail" selectedItem={schemeCode} />
      </section>
    </>
  );
}
