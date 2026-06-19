"use client";
import React, { useState } from "react";

const CryptoAIReportModal = ({ isOpen, onClose, cryptoData }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const generateReport = async () => {
    if (!cryptoData) return;

    setLoading(true);
    try {
      // Prepare detailed crypto context
      const prompt = `
      Generate a detailed cryptocurrency research report for:
      
      OVERVIEW:
      Symbol: ${cryptoData.meta?.symbol?.toUpperCase()}
      Name: ${cryptoData.meta?.name}
      Current Price: $${cryptoData.meta?.current_price || 'N/A'}
      Market Cap: $${cryptoData.meta?.market_cap?.toLocaleString() || 'N/A'}
      24h Volume: $${cryptoData.meta?.total_volume?.toLocaleString() || 'N/A'}

      TECHNICAL & RISK ANALYSIS:
      Annualized Return: ${(cryptoData.riskVolatility?.annualized_return * 100).toFixed(2)}%
      Volatility: ${(cryptoData.riskVolatility?.annualized_volatility * 100).toFixed(2)}%
      Sharpe Ratio: ${cryptoData.riskVolatility?.sharpe_ratio?.toFixed(2)}

      FUTURE OUTLOOK:
      Expected Price (Monte Carlo 1Y): $${cryptoData.monteCarlo?.expected_price?.toFixed(2)}
      Probability of Positive Return: ${cryptoData.monteCarlo?.probability_positive_return}%
      Price Range (5th-95th percentile): $${cryptoData.monteCarlo?.lower_bound_5th_percentile?.toFixed(2)} - $${cryptoData.monteCarlo?.upper_bound_95th_percentile?.toFixed(2)}

      Generate a comprehensive cryptocurrency research report including:

      1. Executive Summary
      2. Token Overview & Technology (Use Case, Network)
      3. Market Position & Supply Dynamics (Circulating Supply)
      4. Risk & Volatility Analysis
         - Volatility Profile
         - Risk Metrics (Sharpe Ratio)
      5. Investment Thesis
         - Growth Catalysts
         - Risks & Vulnerabilities
         - Valuation Perspectives
      6. Future Outlook (Monte Carlo Predictions & Ranges)
      7. Investment Recommendation
         - Buy/Hold/Sell Sentiment
         - Investment Horizon
         - Risk Rating

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

  React.useEffect(() => {
    if (isOpen && !response && !loading) {
      generateReport();
    }
  }, [isOpen]);

  const downloadReport = () => {
    if (!response) return;
    const element = document.createElement("a");
    const file = new Blob([response], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${cryptoData.meta?.name || "crypto"}-AI-Report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    alert("Report copied to clipboard!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl h-[80vh] flex flex-col relative border border-black/10 shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-black/5 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-black tracking-[-0.02em]">Cryptocurrency Research Report</h2>
            <p className="text-black/40 text-xs font-semibold">AI-generated cryptocurrency report</p>
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
                Click the button below to generate a detailed cryptocurrency research report.
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
          <div className="p-6 border-t border-black/5 bg-[#F5F5F5] flex justify-between items-center flex-wrap gap-3">
            <p className="text-black/40 text-xs font-semibold">
              💡 AI-generated cryptocurrency report.
            </p>
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="bg-black/5 hover:bg-black/10 text-black px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 text-xs cursor-pointer border border-black/10"
              >
                Copy
              </button>
              <button
                onClick={downloadReport}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 text-xs cursor-pointer shadow-xs"
              >
                Download
              </button>
              <button
                onClick={generateReport}
                className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full font-semibold transition-all transform hover:scale-[1.02] shadow-xs cursor-pointer text-sm"
              >
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoAIReportModal;
