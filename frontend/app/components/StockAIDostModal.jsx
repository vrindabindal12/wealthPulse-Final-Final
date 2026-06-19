"use client";
import { useState } from "react";

const StockAIDostModal = ({ isOpen, onClose, stockData }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const generateResponse = async () => {
    if (!stockData) return;

    setLoading(true);
    try {
      // Prepare context about the stock
      const prompt = `
      Analyze this stock:
      Symbol: ${stockData.meta?.symbol}
      Company: ${stockData.meta?.longName || stockData.meta?.companyName}
      Industry: ${stockData.meta?.industry || 'N/A'}
      Sector: ${stockData.meta?.sector || 'N/A'}
      Current Price: ₹${stockData.navHistory?.[stockData.navHistory.length - 1]?.close || 'N/A'}
      
      Key Metrics:
      - Annualized Return: ${(stockData.riskVolatility?.annualized_return * 100).toFixed(2)}%
      - Volatility: ${(stockData.riskVolatility?.annualized_volatility * 100).toFixed(2)}%
      - Sharpe Ratio: ${stockData.riskVolatility?.sharpe_ratio?.toFixed(2)}
      
      Monte Carlo Prediction:
      - Expected Price: ₹${stockData.monteCarlo?.expected_price?.toFixed(2)}
      - Probability of Positive Return: ${stockData.monteCarlo?.probability_positive_return}%
      
      Based on the above data, provide a comprehensive stock analysis including:
      1. Overall assessment
      2. Key strengths and risks
      3. Technical analysis insights
      4. Investment recommendation with time horizon
      5. Key factors to monitor

      Format the response with clear headings and bullet points.
      `;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Failed to generate analysis");

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
      console.error("Error generating response:", error);
      setResponse("Sorry, I couldn't generate the analysis. Please try again.");
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
            <h2 className="text-2xl font-bold text-black tracking-[-0.02em]">Stock Analysis</h2>
            <p className="text-black/40 text-xs font-semibold">AI-driven analysis report</p>
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
                Click the button below to generate an AI-powered analysis of this stock.
              </p>
              <button
                onClick={generateResponse}
                className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-[1.02] shadow-xs cursor-pointer text-sm"
              >
                Generate Analysis
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              <p className="text-black/60 text-lg font-medium">Generating analysis...</p>
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
              onClick={generateResponse}
              className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-[1.01] shadow-xs cursor-pointer text-sm"
            >
              Regenerate Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAIDostModal;