"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function AIReportModal({
  isOpen,
  onClose,
  fundData,
  useBackend = false,
}) {
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      // Determine which endpoint to use
      const endpoint = useBackend
        ? "/api/backend/ai/report"
        : "/api/ai/generate-report";
      const requestOptions = {
        method: useBackend ? "GET" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      // Only add body for POST requests (frontend AI)
      if (!useBackend) {
        requestOptions.body = JSON.stringify({ fundData });
      }

      const response = await fetch(endpoint, requestOptions);

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      // For backend endpoints, parse JSON response
      if (useBackend) {
        const data = await response.json();
        setAiResponse(data);
      } else {
        // For frontend endpoints, accumulate streaming text
        let report = "";
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          report += chunk;
        }

        // Treat frontend response as plain text
        setAiResponse({ text: report, format: "plain" });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !aiResponse && !loading) {
      generateReport();
    }
  }, [isOpen]);

  const downloadReport = () => {
    if (!aiResponse) return;
    const element = document.createElement("a");
    const file = new Blob([aiResponse.text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${fundData.meta?.scheme_name || "report"}-AI-Report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse.text);
    alert("Report copied to clipboard!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-black/10 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-black/5 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black/5 rounded-2xl text-black">
              <svg
                className="w-6 h-6"
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
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black tracking-[-0.02em]">
                AI Investment Report
              </h2>
              <p className="text-black/40 text-xs font-semibold">
                {useBackend
                  ? "Portfolio Analysis & Insights"
                  : "Comprehensive Analysis & Insights"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-black/40 hover:text-black hover:bg-black/5 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-[#F5F5F5] flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin border-4 border-black border-t-transparent rounded-full w-12 h-12 mb-4"></div>
              <p className="text-black/60 text-lg font-medium">
                Generating comprehensive report... 📊
              </p>
              <p className="text-black/40 text-sm mt-1 font-semibold">
                This may take a moment
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 text-red-600 max-w-xl mx-auto text-center shadow-xs">
              <p className="font-semibold mb-3">Error: {error}</p>
              <button
                onClick={generateReport}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {aiResponse && (
            <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 text-black shadow-xs max-w-4xl mx-auto">
              {aiResponse.format === "markdown" ? (
                <ReactMarkdown
                  className="prose max-w-none"
                  components={{
                    p: ({ node, ...props }) => (
                      <p
                        className="text-black/80 leading-relaxed my-2"
                        {...props}
                      />
                    ),
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-xl font-bold text-black mt-6 mb-3 tracking-[-0.015em]"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-lg font-bold text-black mt-5 mb-2 tracking-[-0.01em]"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-base font-semibold text-black/95 mt-4 mb-2"
                        {...props}
                      />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4
                        className="text-sm font-semibold text-black/90 mt-3 mb-1"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-6 my-2 text-black/85" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-6 my-2 text-black/85" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="text-black/80 mb-1 leading-relaxed" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold text-black" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                      <em className="italic text-black/90" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-black pl-4 my-2 italic text-black/70 bg-black/[0.02] py-2 rounded-r-lg"
                        {...props}
                      />
                    ),
                    code: ({ node, inline, ...props }) =>
                      inline ? (
                        <code
                          className="bg-black/5 px-2 py-0.5 rounded text-black font-semibold text-xs"
                          {...props}
                        />
                      ) : (
                        <code
                          className="bg-black/5 p-4 rounded-xl block text-black overflow-x-auto text-sm my-3 font-semibold"
                          {...props}
                        />
                      ),
                  }}
                >
                  {aiResponse.text}
                </ReactMarkdown>
              ) : (
                <p className="text-black/80 whitespace-pre-line leading-relaxed">
                  {aiResponse.text}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="bg-[#F5F5F5] px-6 py-4 flex justify-between items-center border-t border-black/5 flex-wrap gap-3">
          <p className="text-black/40 text-xs font-semibold">
            💡 Professional AI-generated investment report.
          </p>
          <div className="flex gap-3">
            {aiResponse && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="bg-black/5 hover:bg-black/10 text-black px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 text-xs cursor-pointer border border-black/10"
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </button>
                <button
                  onClick={downloadReport}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 text-xs cursor-pointer shadow-xs"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full font-semibold transition-all transform hover:scale-[1.02] shadow-xs cursor-pointer text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
