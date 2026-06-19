"use client";

import { useState, useRef, useEffect } from "react";

const Chatbot = ({ selectedFund, currentPage = "home", selectedItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (customPrompt = "") => {
    const activePrompt = (typeof customPrompt === "string" && customPrompt) ? customPrompt : input;
    if (!activePrompt.trim() || loading) return;

    const userMessage = { role: "user", content: activePrompt };
    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt || typeof customPrompt !== "string") {
      setInput("");
    }
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: activePrompt,
          currentPage,
          selectedItem
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Chat API error:', response.status, errorData);
        throw new Error(errorData || "Failed to get response");
      }

      const reader = response.body.getReader();
      let botResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        botResponse += chunk;
        
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          
          if (lastMessage?.role === "assistant") {
            lastMessage.content = botResponse;
          } else {
            newMessages.push({ role: "assistant", content: botResponse });
          }
          
          return newMessages;
        });
      }

    } catch (error) {
      console.error("Chat error:", error);
      let errorMessage = "Oops! Something went wrong. Please try again in a moment.";
      
      try {
        const errorData = error.message && error.message.startsWith('{')
          ? JSON.parse(error.message)
          : null;

        if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (error.message === "Failed to fetch") {
          errorMessage = "Unable to connect to the chat service. Please check your internet connection.";
        }
      } catch (e) {
        console.error("Error parsing error message:", e);
      }

      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const promptsByPage = {
    home: [
      "How do I start investing?",
      "What features does WealthPulse offer?",
      "Tell me about Monte Carlo projections.",
    ],
    stocks: [
      "What are the top Indian stocks?",
      "How can I analyze stock volatility?",
      "Explain stock Monte Carlo simulations.",
    ],
    "stock-detail": [
      `What is the analysis of ${selectedItem || "this stock"}?`,
      "Is this stock high risk or low risk?",
      "Show some key metrics for this stock.",
    ],
    "mutual-funds": [
      "What is NAV in Mutual Funds?",
      "Which mutual funds are best for long term?",
      "Explain Sharpe Ratio.",
    ],
    "fund-detail": [
      `Analyze mutual fund ${selectedItem || "this fund"}.`,
      "What is the annualized return here?",
      "Explain the risk metrics of this fund.",
    ],
    crypto: [
      "What is the best crypto asset?",
      "Explain risk-volatility for crypto.",
      "What does AI Dost recommend for crypto.",
    ],
    "crypto-detail": [
      `Is ${selectedItem || "this crypto"} high risk?`,
      "What is its ATH and market cap?",
      "Show a 1-year prediction for it.",
    ],
    courses: [
      "What courses are available?",
      "Tell me about the stock trading course.",
      "How do I learn personal finance?",
    ],
  };

  const suggestions = promptsByPage[currentPage] || promptsByPage["home"];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 rounded-full text-white shadow-[0_8px_30px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer"
          aria-label="Open AI Dost Assistant"
        >
          {/* Pulsing Outer Ring */}
          <span className="absolute inset-0 rounded-full bg-purple-600/30 animate-ping group-hover:animate-none opacity-75"></span>
          
          <svg className="w-7 h-7 relative z-10 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      ) : (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-[390px] h-[520px] flex flex-col border border-black/10 overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 bg-white border-b border-black/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center shadow-inner">
                  <span className="text-white text-xs font-bold font-mono">AD</span>
                </div>
                {/* Online Status Indicator */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
              </div>
              <div>
                <h3 className="text-black text-[15px] font-semibold tracking-tight">AI Dost</h3>
                <p className="text-[10px] text-black/50 font-medium">Your Wealth Companion</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-black/5 text-black/60 hover:text-black hover:bg-black/10 transition-all flex items-center justify-center cursor-pointer"
              aria-label="Close Assistant"
            >
              ✕
            </button>
          </div>

          {/* Messages Pane */}
          <div className="flex-1 px-5 py-4 overflow-y-auto space-y-4 bg-[#fbfbfb]/80">
            {messages.length === 0 ? (
              <div className="space-y-4 py-4">
                <div className="bg-black/5 border border-black/5 rounded-2xl p-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">👋</span>
                  </div>
                  <h4 className="text-black font-semibold text-base mb-1.5">Namaste! I'm AI Dost</h4>
                  <p className="text-black/60 text-xs leading-relaxed max-w-[280px] mx-auto mb-4">
                    Your personal finance assistant. Ask me anything about Indian markets, portfolio allocation, or mutual funds!
                  </p>
                </div>
                
                {/* Suggestions Header */}
                <div className="space-y-2">
                  <p className="text-[11px] text-black/40 uppercase tracking-wider font-semibold ml-1">Suggested Questions</p>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((promptText, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(promptText)}
                        className="text-left text-xs bg-black/5 hover:bg-purple-600/10 hover:border-purple-500/20 text-black/85 hover:text-purple-600 px-4 py-3 rounded-xl border border-black/5 transition-all cursor-pointer font-medium"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-tr-none"
                        : "bg-black/5 border border-black/5 text-black/90 rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            
            {/* Animated Typing Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-black/5 border border-black/5 px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 w-fit">
                  <div className="w-2.5 h-2.5 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2.5 h-2.5 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2.5 h-2.5 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}
            
            {/* Anchor for Auto-scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <div className="px-5 py-4 border-t border-black/10 bg-[#f9f9fc]">
            <div className="flex items-center gap-2 bg-white border border-black/10 rounded-full px-4 py-2 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                type="text"
                placeholder="Ask AI Dost a question..."
                className="flex-1 bg-transparent text-black text-[13px] outline-none placeholder-black/35 py-1.5"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !input.trim()}
                className={`p-2.5 rounded-full transition-all cursor-pointer ${
                  loading || !input.trim()
                    ? "text-black/20 bg-transparent"
                    : "text-white bg-gradient-to-tr from-purple-500 to-indigo-600 hover:scale-105 shadow-md"
                }`}
                aria-label="Send Message"
              >
                {loading ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 transform rotate-45 -translate-x-[1px] translate-y-[1px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Chatbot;