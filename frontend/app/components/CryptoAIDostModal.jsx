"use client";
import React, { useState } from "react";

const CryptoAIDostModal = ({ isOpen, onClose, cryptoData }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const generateResponse = async () => {
    if (!cryptoData) return;

    setLoading(true);
    try {
      // Prepare context about the crypto
      const prompt = `
      Analyze this cryptocurrency:
      Symbol: ${cryptoData.meta?.symbol?.toUpperCase()}
      Name: ${cryptoData.meta?.name}
      Current Price: $${cryptoData.meta?.current_price || 'N/A'}
      Market Cap: $${cryptoData.meta?.market_cap?.toLocaleString() || 'N/A'}
      24h Volume: $${cryptoData.meta?.total_volume?.toLocaleString() || 'N/A'}
      
      Key Metrics:
      - Annualized Return: ${(cryptoData.riskVolatility?.annualized_return * 100).toFixed(2)}%
      - Volatility: ${(cryptoData.riskVolatility?.annualized_volatility * 100).toFixed(2)}%
      - Sharpe Ratio: ${cryptoData.riskVolatility?.sharpe_ratio?.toFixed(2)}
      
      Monte Carlo Prediction:
      - Expected Price: $${cryptoData.monteCarlo?.expected_price?.toFixed(2)}
      - Probability of Gain: ${cryptoData.monteCarlo?.probability_positive_return}%
      
      Based on the above data, provide a comprehensive cryptocurrency analysis including:
      1. Overall assessment
      2. Key strengths and risks
      3. Technical and risk analysis insights
      4. Investment recommendation with time horizon
      5. Key factors to monitor (e.g. market cycles, supply dynamics)

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

  React.useEffect(() => {
    if (isOpen && !response && !loading) {
      generateResponse();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl h-[80vh] flex flex-col relative border border-black/10 shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-black/5 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-black tracking-[-0.02em]">Cryptocurrency Analysis</h2>
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
                Click the button below to generate an AI-powered analysis of this cryptocurrency.
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
          <div className="p-6 border-t border-black/5 bg-[#F5F5F5] flex justify-between items-center">
            <p className="text-black/40 text-xs font-semibold">
              💡 AI-generated analysis. Please verify before investing.
            </p>
            <button
              onClick={generateResponse}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full font-semibold transition-all transform hover:scale-[1.01] shadow-xs cursor-pointer text-sm"
            >
              Regenerate Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoAIDostModal;
