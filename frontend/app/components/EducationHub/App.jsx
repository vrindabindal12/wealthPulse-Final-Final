import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../../style";

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

const initialVideos = [
  { title: "Stock Market for Beginners", videoId: "p7HKvqRI_Bo" },
  { title: "How to Invest in ETFs", videoId: "PHe0bXAIuk0" },
  { title: "Mutual Funds Explained", videoId: "1d_jYPL6uUI" },
  { title: "Cryptocurrency Investing", videoId: "9nlhmVrkv1Q" },
  { title: "What Are Bonds & How Do They Work?", videoId: "xVU4byInxk4" },
  { title: "Ethereum and Smart Contracts", videoId: "pWGLtjG-F5c" },
];

const trendingNews = [
  {
    title: "Tech Stocks Surge in 2025",
    summary: "Analysts predict a boom in tech investments with AI leading the sector growth.",
    url: "https://www.google.com/search?q=tech+stocks+surge+2025",
  },
  {
    title: "Crypto Market Volatility Continues",
    summary: "Bitcoin and Ethereum face fluctuations as global regulations tighten.",
    url: "https://www.google.com/search?q=crypto+market+volatility+2025",
  },
  {
    title: "Federal Reserve Rate Cut Impact",
    summary: "How lower interest rates affect bond yields, mortgages, and equity markets in 2025.",
    url: "https://www.google.com/search?q=federal+reserve+rate+cut+2025",
  },
  {
    title: "Emerging Markets Gain Momentum",
    summary: "Investment trends shift towards developing economies offering high return potential.",
    url: "https://www.google.com/search?q=emerging+markets+2025",
  },
];

const EducationHub = () => {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState(initialVideos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchVideos = async () => {
    if (!query) {
      setError("Please enter a search term.");
      return;
    }
    if (!YOUTUBE_API_KEY) {
      setError("Invalid or missing YouTube API key.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=6&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (!data.items || data.items.length === 0) throw new Error("No videos found.");
      setVideos(
        data.items.map((item) => ({
          title: item.snippet.title,
          videoId: item.id.videoId,
        }))
      );
    } catch (err) {
      setError(`Failed to fetch videos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.paddingX} bg-[#F5F5F5] min-h-screen text-black`}>
      <div className={`${styles.boxWidth} mx-auto`}>
        
        {/* Header Title Section */}
        <div className="text-center mb-12">
          <motion.h1
            className="text-5xl md:text-6xl font-medium mb-4 tracking-tight text-black"
            style={{ letterSpacing: '-0.04em' }}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Financial Education Hub.
          </motion.h1>
          <motion.p
            className="text-black/60 text-lg max-w-2xl mx-auto font-normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Master personal finance, stock analysis, and crypto investments with curated tutorials and trending updates.
          </motion.p>
        </div>

        {/* Search Field Wrapper */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-16 max-w-2xl mx-auto relative group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-black/5 blur-xl opacity-50 group-focus-within:opacity-100 transition-opacity duration-500 rounded-full"></div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search financial videos..."
            className="relative w-full px-6 py-4 rounded-full bg-white border border-black/10 text-black text-lg focus:outline-none focus:border-black/35 focus:ring-2 focus:ring-black/5 shadow-xs transition-all placeholder:text-black/40 font-medium"
          />
          <motion.button
            onClick={fetchVideos}
            className="relative sm:absolute right-2 top-1/2 sm:-translate-y-1/2 py-2.5 px-6 font-sans font-semibold text-base text-white bg-black hover:bg-gray-800 rounded-full outline-none transition-all cursor-pointer shadow-md"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Search
          </motion.button>
        </motion.div>

        {loading && <p className="text-black/60 text-center mb-8 font-medium">Loading videos...</p>}
        {error && <p className="text-center text-red-600 mb-8 font-medium">⚠️ {error}</p>}

        {/* Video Card Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {videos.map((video, index) => (
            <motion.div
              key={index}
              className="bg-white border border-black/5 p-5 rounded-[1.5rem] shadow-xs flex flex-col hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] hover:border-black/15 transition-all duration-400 h-full overflow-hidden"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <h3 className="text-black font-semibold text-lg tracking-tight mb-4 line-clamp-2 min-h-[56px] leading-snug" title={video.title}>
                {video.title}
              </h3>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-black/5 bg-gray-50 flex-grow shadow-inner">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${video.videoId}`}
                  frameBorder="0"
                  allowFullScreen
                  title={video.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider line */}
        <hr className="border-black/5 mb-16" />

        {/* Trending News Header */}
        <div className="text-center mb-12">
          <motion.h2
            className="text-4xl font-medium tracking-tight text-black"
            style={{ letterSpacing: '-0.03em' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Trending Financial News.
          </motion.h2>
        </div>

        {/* News Card Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {trendingNews.map((news, index) => (
            <motion.div
              key={index}
              className="bg-white border border-black/5 p-6 rounded-[1.5rem] shadow-xs flex flex-col justify-between hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] hover:border-black/15 transition-all duration-400"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
            >
              <div>
                {/* News Icon Badge */}
                <div className="w-10 h-10 rounded-full bg-black/5 text-black flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 00-2-2v3m2 3V10" />
                  </svg>
                </div>
                <h3 className="text-black font-semibold text-xl tracking-tight mb-2">
                  {news.title}
                </h3>
                <p className="text-black/60 text-sm leading-relaxed mb-6 font-normal">
                  {news.summary}
                </p>
              </div>
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-fit text-center inline-flex justify-center items-center gap-2 bg-black/5 text-black text-sm font-semibold px-5 py-3 rounded-xl border border-black/5 hover:text-white hover:bg-black hover:border-transparent transition-all duration-300 cursor-pointer"
              >
                Read Full Story →
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default EducationHub;
