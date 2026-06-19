"use client";

import { useEffect, useState, useCallback } from "react";
import useUser from "@/lib/authClient";
import AIDostModal from "../components/AIDostModal";
import AIReportModal from "../components/AIReportModal";

export default function PortfolioPage() {
  const { user, isSignedIn, isLoading } = useUser();
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAIDost, setShowAIDost] = useState(false);
  const [showAIReport, setShowAIReport] = useState(false);
  const [riskVolatility, setRiskVolatility] = useState({});
  const [monteCarlo, setMonteCarlo] = useState({});

  // Buy history modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Function to calculate aggregate portfolio metrics
  const calculatePortfolioMetrics = useCallback(async () => {
    if (!portfolioItems.length) return;

    try {
      const totalRisk = portfolioItems.reduce(
        (acc, item) => acc + (item.risk_volatility?.annualized_volatility || 0),
        0,
      );
      const avgVolatility = totalRisk / portfolioItems.length;

      const totalReturn = portfolioItems.reduce(
        (acc, item) => acc + (item.risk_volatility?.annualized_return || 0),
        0,
      );
      const avgReturn = totalReturn / portfolioItems.length;

      setRiskVolatility({
        annualized_volatility: avgVolatility,
        annualized_return: avgReturn,
        sharpe_ratio: (avgReturn - 0.05) / avgVolatility,
      });

      setMonteCarlo({
        expected_nav: portfolioItems.reduce(
          (acc, item) => acc + (item.nav || 0),
          0,
        ),
        probability_positive_return: avgReturn > 0 ? 75 : 45,
        lower_bound_5th_percentile: avgReturn * 0.95,
        upper_bound_95th_percentile: avgReturn * 1.05,
      });
    } catch (error) {
      console.error("Error calculating portfolio metrics:", error);
    }
  }, [portfolioItems]);

  useEffect(() => {
    calculatePortfolioMetrics();
  }, [calculatePortfolioMetrics]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (isLoading) {
        return; // Still loading, don't fetch yet
      }

      if (!isSignedIn || !user) {
        setError("Please sign in to view your portfolio");
        setLoading(false);
        return;
      }

      try {
        // Fetch analytics which includes all holdings with computed metrics
        const response = await fetch("/api/backend/analytics/portfolio", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch portfolio analytics");
        }

        const analytics = await response.json();

        // Map backend response structure to our state
        // Backend returns: { summary: {...}, holdings: [...] }
        // Each holding includes: id, symbol, name, asset_type, quantity, buy_price, current_price, pnl, xirr, montecarlo, risk
        const itemsWithMetrics = analytics.holdings.map((holding) => ({
          // Map to the old item_type field name for compatibility with UI
          id: holding.id,
          symbol: holding.symbol,
          name: holding.name,
          item_type:
            holding.asset_type === "mutualfund"
              ? "mutual_fund"
              : holding.asset_type,
          quantity: holding.quantity,
          buy_price: holding.buy_price,
          current_price: holding.current_price,
          // Add computed metrics in risk_volatility structure for portfolio metric calculations
          risk_volatility: holding.risk || {},
          // Include montecarlo data
          montecarlo: holding.montecarlo || {},
          // Store raw holding data for modal display
          _backendHolding: holding,
        }));

        setPortfolioItems(itemsWithMetrics);

        // Update portfolio metrics from backend summary
        if (analytics.summary) {
          setRiskVolatility(analytics.summary || {});
          setMonteCarlo(analytics.summary?.montecarlo || {});
        }
      } catch (err) {
        console.error("Error fetching portfolio:", err);
        setError("Failed to fetch your portfolio. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [isSignedIn, user, isLoading]);

  const handleRemoveItem = async (itemId) => {
    if (!isSignedIn || !user) {
      alert("Please sign in to remove items");
      return;
    }

    try {
      const response = await fetch(`/api/backend/portfolio/holding/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      setPortfolioItems((items) => items.filter((item) => item.id !== itemId));
      alert("Item removed successfully!");

      // Refetch analytics to ensure UI is in sync with backend
      const analyticsResponse = await fetch(
        "/api/backend/analytics/portfolio",
        {
          cache: "no-store",
        },
      );

      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json();
        const itemsWithMetrics = analytics.holdings.map((holding) => ({
          id: holding.id,
          symbol: holding.symbol,
          name: holding.name,
          item_type:
            holding.asset_type === "mutualfund"
              ? "mutual_fund"
              : holding.asset_type,
          quantity: holding.quantity,
          buy_price: holding.buy_price,
          current_price: holding.current_price,
          risk_volatility: holding.risk || {},
          montecarlo: holding.montecarlo || {},
          _backendHolding: holding,
        }));
        setPortfolioItems(itemsWithMetrics);
      }
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item. Please try again.");
    }
  };

  const handleViewHistory = async (symbol, name) => {
    if (!isSignedIn || !user) {
      alert("Please sign in to view holding history");
      return;
    }

    try {
      setHistoryLoading(true);
      setSelectedSymbol({ symbol, name });

      // Find the portfolio item to get current_price
      const item = portfolioItems.find((p) => p.symbol === symbol);
      setSelectedItem(item);

      const response = await fetch(
        `/api/backend/portfolio/history/${encodeURIComponent(symbol)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch holding history");
      }

      const data = await response.json();
      setHistoryData(data);
      setShowHistoryModal(true);
    } catch (err) {
      console.error("Error fetching history:", err);
      alert("Failed to load buy history. Please try again.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteLot = async (lotId) => {
    if (!window.confirm("Are you sure you want to delete this lot?")) {
      return;
    }

    try {
      const response = await fetch(`/api/backend/portfolio/holding/${lotId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete lot");
      }

      // Remove from history
      setHistoryData((prev) => prev.filter((lot) => lot.id !== lotId));

      // Refetch portfolio items to update the aggregated card
      const analyticsResponse = await fetch(
        "/api/backend/analytics/portfolio",
        {
          cache: "no-store",
        },
      );

      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json();
        const itemsWithMetrics = analytics.holdings.map((holding) => ({
          id: holding.id,
          symbol: holding.symbol,
          name: holding.name,
          item_type:
            holding.asset_type === "mutualfund"
              ? "mutual_fund"
              : holding.asset_type,
          quantity: holding.quantity,
          buy_price: holding.buy_price,
          current_price: holding.current_price,
          risk_volatility: holding.risk || {},
          montecarlo: holding.montecarlo || {},
          _backendHolding: holding,
        }));
        setPortfolioItems(itemsWithMetrics);
      }

      alert("Lot deleted successfully!");
    } catch (err) {
      console.error("Error deleting lot:", err);
      alert("Failed to delete lot. Please try again.");
    }
  };

  if (!isSignedIn && !isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 bg-[#F5F5F5] text-black">
        <div className="max-w-7xl mx-auto text-center mt-12">
          <h1 className="text-3xl font-bold text-black mb-4">Please Sign In</h1>
          <p className="text-black/60">
            You need to be signed in to view your portfolio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-[#F5F5F5] text-black">
      <div className="max-w-6xl mx-auto mt-12 px-6">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
                My Portfolio
              </h1>
              <p className="text-black/60">Manage your finance</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowAIDost(true)}
                className="bg-black text-white hover:bg-gray-800 px-6 py-2.5 rounded-full font-semibold text-base transition-all transform hover:scale-105 shadow-md flex items-center gap-2 cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
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
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-full font-semibold text-base transition-all transform hover:scale-105 shadow-md flex items-center gap-2 cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
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

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-red-600">
            {error}
          </div>
        ) : portfolioItems.length === 0 ? (
          <div className="text-center py-12 bg-white border border-black/5 rounded-[1.5rem] shadow-xs">
            <p className="text-black/60 font-medium">
              Your portfolio is empty. Add some stocks or mutual funds from the
              dashboards!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleViewHistory(item.symbol, item.name)}
                className="bg-white border border-black/5 rounded-[1.5rem] p-6 shadow-xs flex flex-col hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] hover:border-black/15 transition-all duration-400 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-black/40 font-medium">{item.symbol}</p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                    style={{
                      backgroundColor:
                        item.item_type === "stock"
                          ? "rgba(16, 185, 129, 0.1)"
                          : "rgba(139, 92, 246, 0.1)",
                      color: item.item_type === "stock" ? "#10B981" : "#8B5CF6",
                    }}
                  >
                    {item.item_type}
                  </span>
                </div>

                {/* Investment Details */}
                <div className="space-y-3 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black/40">Quantity:</span>
                    <span className="text-black font-medium">
                      {Number(item.quantity).toLocaleString("en-IN", {
                        maximumFractionDigits: 4,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/40">Buy Price:</span>
                    <span className="text-black font-medium">
                      ₹
                      {Number(item.buy_price ?? 0).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between bg-black/5 rounded-xl px-4 py-2.5">
                    <span className="text-black/70 font-semibold">Invested:</span>
                    <span className="text-emerald-600 font-bold">
                      ₹
                      {(
                        Number(item.quantity ?? 0) * Number(item.buy_price ?? 0)
                      ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {item.current_price != null && item.current_price > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-black/40">Current Price:</span>
                        <span className="text-black font-medium">
                          ₹
                          {Number(item.current_price).toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/40">Current Value:</span>
                        <span className="text-black font-medium">
                          ₹
                          {Number(item.current_value || 0).toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 2,
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between bg-black/5 rounded-xl px-4 py-2.5">
                        <span className="text-black/70 font-semibold">P&L:</span>
                        <div className="text-right">
                          <div
                            className={`font-bold text-lg ${(item._backendHolding?.pnl ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {(item._backendHolding?.pnl ?? 0) >= 0 ? "+" : ""}₹
                            {Number(
                              item._backendHolding?.pnl ?? 0,
                            ).toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div
                            className={`text-sm font-semibold ${(item._backendHolding?.pnl_pct ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}
                          >
                            {(item._backendHolding?.pnl_pct ?? 0) >= 0
                              ? "+"
                              : ""}
                            {Number(item._backendHolding?.pnl_pct ?? 0).toFixed(
                              2,
                            )}
                            %
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-black/40 border-t border-black/5 pt-4 mt-2">
                  <span>
                    Added:{" "}
                    {item._backendHolding?.created_at
                      ? new Date(
                          item._backendHolding.created_at,
                        ).toLocaleDateString()
                      : "—"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(item.id);
                    }}
                    className="text-red-500 hover:text-red-600 transition-colors font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Modals */}
        <AIDostModal
          isOpen={showAIDost}
          onClose={() => setShowAIDost(false)}
          fundData={{
            meta: {
              portfolio_size: portfolioItems.length,
              stocks_count: portfolioItems.filter(
                (i) => i.item_type === "stock",
              ).length,
              mutual_funds_count: portfolioItems.filter(
                (i) => i.item_type === "mutual_fund",
              ).length,
              last_added: portfolioItems[0]?.added_at,
            },
            riskVolatility,
            monteCarlo,
            portfolioItems,
          }}
          useBackend={true}
        />

        <AIReportModal
          isOpen={showAIReport}
          onClose={() => setShowAIReport(false)}
          fundData={{
            meta: {
              portfolio_size: portfolioItems.length,
              stocks_count: portfolioItems.filter(
                (i) => i.item_type === "stock",
              ).length,
              mutual_funds_count: portfolioItems.filter(
                (i) => i.item_type === "mutual_fund",
              ).length,
              last_added: portfolioItems[0]?.added_at,
            },
            riskVolatility,
            monteCarlo,
            portfolioItems,
          }}
          useBackend={true}
        />

        {/* Buy History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-black/10 shadow-2xl flex flex-col">
              <div className="sticky top-0 bg-white border-b border-black/5 p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-black">Buy History</h2>
                  <p className="text-black/50 text-sm">
                    {selectedSymbol?.name} ({selectedSymbol?.symbol})
                  </p>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-black/40 hover:text-black hover:bg-black/5 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all cursor-pointer"
                >
                  ×
                </button>
              </div>

              {historyLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : (
                <div className="p-6">
                  {/* Aggregated Summary */}
                  {historyData.length > 0 && (
                    <div className="bg-black/5 rounded-xl p-5 mb-6 border border-black/5">
                      <h3 className="text-black font-semibold mb-4 text-base">
                        Aggregated Summary
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-black/50 text-xs mb-1 font-medium">
                            Total Quantity
                          </div>
                          <div className="text-black font-bold text-lg">
                            {historyData
                              .reduce(
                                (sum, lot) => sum + Number(lot.quantity || 0),
                                0,
                              )
                              .toLocaleString("en-IN", {
                                maximumFractionDigits: 8,
                              })}
                          </div>
                        </div>
                        <div>
                          <div className="text-black/50 text-xs mb-1 font-medium">
                            Total Invested
                          </div>
                          <div className="text-emerald-600 font-bold text-lg">
                            ₹
                            {historyData
                              .reduce(
                                (sum, lot) =>
                                  sum +
                                  Number(lot.quantity || 0) *
                                    Number(lot.buy_price || 0),
                                0,
                              )
                              .toLocaleString("en-IN", {
                                maximumFractionDigits: 2,
                              })}
                          </div>
                        </div>
                        <div>
                          <div className="text-black/50 text-xs mb-1 font-medium">
                            Avg Buy Price
                          </div>
                          <div className="text-black font-bold text-lg">
                            ₹
                            {(
                              historyData.reduce(
                                (sum, lot) =>
                                  sum +
                                  Number(lot.quantity || 0) *
                                    Number(lot.buy_price || 0),
                                0,
                              ) /
                              (historyData.reduce(
                                (sum, lot) => sum + Number(lot.quantity || 0),
                                0,
                              ) || 1)
                            ).toLocaleString("en-IN", {
                              maximumFractionDigits: 4,
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="text-black/50 text-xs mb-1 font-medium">
                            Current Value
                          </div>
                          <div className="text-blue-600 font-bold text-lg">
                            ₹
                            {(selectedItem?.current_price &&
                            selectedItem.current_price > 0
                              ? historyData.reduce(
                                  (sum, lot) => sum + Number(lot.quantity || 0),
                                  0,
                                ) * selectedItem.current_price
                              : selectedItem?.current_value || 0
                            ).toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-black/10">
                        {(() => {
                          const totalInvested = historyData.reduce(
                            (sum, lot) =>
                              sum +
                              Number(lot.quantity || 0) *
                                Number(lot.buy_price || 0),
                            0,
                          );
                          const currentValue =
                            selectedItem?.current_price &&
                            selectedItem.current_price > 0
                              ? historyData.reduce(
                                  (sum, lot) => sum + Number(lot.quantity || 0),
                                  0,
                                ) * selectedItem.current_price
                              : selectedItem?.current_value || 0;
                          const pnl = currentValue - totalInvested;
                          const pnlPct =
                            totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
                          const isProfitable = pnl >= 0;

                          return (
                            <div className="flex justify-between items-center">
                              <span className="text-black/70 font-semibold">
                                Profit / Loss:
                              </span>
                              <div className="text-right">
                                <div
                                  className={`font-bold text-2xl ${isProfitable ? "text-green-600" : "text-red-600"}`}
                                >
                                  {isProfitable ? "+" : ""}₹
                                  {Math.abs(pnl).toLocaleString("en-IN", {
                                    maximumFractionDigits: 2,
                                  })}
                                </div>
                                <div
                                  className={`text-sm font-semibold ${isProfitable ? "text-green-500" : "text-red-500"}`}
                                >
                                  {isProfitable ? "+" : ""}
                                  {pnlPct.toFixed(2)}%
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Lot Details Table */}
                  <h3 className="text-black font-semibold mb-4 text-base">
                    Individual Lots
                  </h3>
                  {historyData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-black/10">
                            <th className="text-left py-3 px-4 text-black/40 font-semibold text-xs uppercase tracking-wider">
                              Buy Date
                            </th>
                            <th className="text-right py-3 px-4 text-black/40 font-semibold text-xs uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="text-right py-3 px-4 text-black/40 font-semibold text-xs uppercase tracking-wider">
                              Buy Price
                            </th>
                            <th className="text-right py-3 px-4 text-black/40 font-semibold text-xs uppercase tracking-wider">
                              Invested
                            </th>
                            <th className="text-center py-3 px-4 text-black/40 font-semibold text-xs uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyData.map((lot) => (
                            <tr
                              key={lot.id}
                              className="border-b border-black/5 hover:bg-black/5 transition-all duration-200"
                            >
                              <td className="py-3 px-4 text-black font-medium">
                                {new Date(lot.buy_date).toLocaleDateString()}
                              </td>
                              <td className="text-right py-3 px-4 text-black font-medium">
                                {Number(lot.quantity).toLocaleString("en-IN", {
                                  maximumFractionDigits: 8,
                                })}
                              </td>
                              <td className="text-right py-3 px-4 text-black font-medium">
                                ₹
                                {Number(lot.buy_price).toLocaleString("en-IN", {
                                  maximumFractionDigits: 4,
                                })}
                              </td>
                              <td className="text-right py-3 px-4 text-emerald-600 font-semibold">
                                ₹
                                {(
                                  Number(lot.quantity) * Number(lot.buy_price)
                                ).toLocaleString("en-IN", {
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="text-center py-3 px-4">
                                <button
                                  onClick={() => handleDeleteLot(lot.id)}
                                  className="text-red-500 hover:text-red-600 text-sm font-semibold transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-black/40">
                      No buy history found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
