"use client";
import { useState } from "react";

const StockAIReportModal = ({ isOpen, onClose, stockData }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const generateReport = async () => {
    if (!stockData) return;

    setLoading(true);
    try {
      // Prepare detailed stock context
      const prompt = `
      Generate a detailed stock research report for:
      
      COMPANY OVERVIEW:
      Symbol: ${stockData.meta?.symbol}
      Company Name: ${stockData.meta?.longName || stockData.meta?.companyName}
      Industry: ${stockData.meta?.industry || 'N/A'}
      Sector: ${stockData.meta?.sector || 'N/A'}
      Market Cap: ₹${stockData.meta?.marketCap?.toLocaleString() || 'N/A'}

      TECHNICAL ANALYSIS:
      Current Price: ₹${stockData.navHistory?.[stockData.navHistory.length - 1]?.close || 'N/A'}
      Annualized Return: ${(stockData.riskVolatility?.annualized_return * 100).toFixed(2)}%
      Volatility: ${(stockData.riskVolatility?.annualized_volatility * 100).toFixed(2)}%
      Sharpe Ratio: ${stockData.riskVolatility?.sharpe_ratio?.toFixed(2)}

      FUTURE OUTLOOK:
      Expected Price (Monte Carlo): ₹${stockData.monteCarlo?.expected_price?.toFixed(2)}
      Probability of Positive Return: ${stockData.monteCarlo?.probability_positive_return}%
      Price Range (5th-95th percentile): ₹${stockData.monteCarlo?.lower_bound_5th_percentile?.toFixed(2)} - ₹${stockData.monteCarlo?.upper_bound_95th_percentile?.toFixed(2)}

      Generate a comprehensive stock research report including:

      1. Executive Summary
      2. Company Overview & Business Model
      3. Industry Analysis & Competitive Position
      4. Technical Analysis
         - Price Trends
         - Volatility Analysis
         - Risk Metrics
      5. Investment Thesis
         - Growth Drivers
         - Risk Factors
         - Valuation Analysis
      6. Future Outlook & Price Targets
      7. Investment Recommendation
         - Buy/Hold/Sell Rating
         - Target Price Range
         - Investment Horizon
         - Risk Level

      Format the report professionally with clear sections and bullet points where appropriate.
      Keep language clear and accessible for retail investors.
      `;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      let fullResponse = "";
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullResponse += chunk;
        setResponse(fullResponse);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      setResponse("Sorry, I couldn't generate the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl h-[80vh] flex flex-col relative border border-black/10 shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-black/5 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-black tracking-[-0.02em]">Stock Research Report</h2>
            <p className="text-black/40 text-xs font-semibold">AI-generated stock report</p>
          </div>
          <button
            onClick={onClose}
            className="text-black/40 hover:text-black hover:bg-black/5 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#F5F5F5]">
          {!response && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 max-w-md mx-auto text-center">
              <p className="text-black/60 font-medium leading-relaxed">
                Click the button below to generate a detailed stock research report.
              </p>
              <button
                onClick={generateReport}
                className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-[1.02] shadow-xs cursor-pointer text-sm"
              >
                Generate Report
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              <p className="text-black/60 text-lg font-medium">Generating report...</p>
            </div>
          )}

          {response && !loading && (
            <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 text-black shadow-xs max-w-3xl mx-auto">
              <div className="prose max-w-none text-black/80 whitespace-pre-wrap leading-relaxed">
                {response}
              </div>
            </div>
          )}
        </div>

        {response && (
          <div className="p-6 border-t border-black/5 bg-[#F5F5F5]">
            <button
              onClick={generateReport}
              className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-[1.01] shadow-xs cursor-pointer text-sm"
            >
              Regenerate Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAIReportModal;