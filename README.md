# WealthPulse

WealthPulse is an AI-powered portfolio cockpit for retail investors. Track stocks, mutual funds, and crypto in one place, analyze real risk/return analytics, and interact with specialized AI copilots (AI Dost & AI Report) for tailored financial guidance.

---

## Key Features & Recent Enhancements

### 1. Unified Multi-Asset Tracking
* **Comprehensive Dashboard:** Add stocks, mutual funds, and crypto with buy price, quantity, and buy date.
* **Smart Aggregation:** Consolidated lot-level buys of the exact same asset are grouped automatically into a single aggregated position showing average buy price and total quantity, while maintaining full granular transaction history.
* **Performance Indicators:** View real-time per-holding and overall portfolio P&L, XIRR calculations, and history timeline charts.

### 2. Premium Design & Aesthetics
* **Dynamic Video Hero:** The landing page features a cinematic background video overlayed with a sleek brand marquee highlighting key tracked indices and asset classes (Nifty 50, Sensex, Nasdaq, Bitcoin, Gold, etc.).
* **Infinite Scroll Testimonials:** A smooth, infinite-scrolling marquee presenting responsive reviews from retail investors, CFPs, and quant analysts.
* **Contextual Styling:** A polished navigation header that transitions seamlessly between dark modes and customized light theme dashboards tailored for stocks, cryptos, and mutual funds.

### 3. Market Data Ingestion
* **Real-time Pricing Streams:** Pushes instant prices to Redis using:
  * **Crypto:** Live Binance WebSocket feeds.
  * **US Stocks:** Live Finnhub WebSocket feeds.
  * **Indian Stocks:** Periodic `yfinance` polling.
  * **Mutual Funds:** Scheduled parser that downloads, reads, and caches NAV files directly from the Association of Mutual Funds in India (AMFI).

### 4. Risk Analytics & Backfills
* **Lazy Price Backfilling:** When an asset is newly added to a portfolio, background workers fetch up to a year of historical pricing asynchronously:
  * Stocks retrieve data via `yfinance`.
  * Mutual funds fetch historical NAVs from `api.mfapi.in`.
  * Cryptocurrencies ingest market data from CoinGecko's `market_chart` endpoint.
* **Advanced Risk Metrics:** Computes standard deviation (volatility), Sharpe ratio, and maximum drawdown using Pandas dataframes.
* **1-Year Monte Carlo Simulations:** Runs randomized predictive path simulations for holdings based on past volatility, cached in Redis for fast rendering.
* **Data Stability Handling:** Replaces infinite yields and percentage change anomalies (`inf` / `-inf`) with `NaN`/`0.0` inside return calculations to guarantee crash-free serialization and storage.

### 5. Specialized AI Copilots
* **AI Dost:** A conversational companion providing simple explanations of your portfolio performance along with interactive suggestion chips.
* **AI Report:** Generates highly structured, professional-grade portfolio reviews covering allocation, risk assessment, and asset performance.
* **Asset-Specific Context:** Custom modal systems built for Stocks (`StockAIDostModal`, `StockAIReportModal`) and Crypto (`CryptoAIDostModal`, `CryptoAIReportModal`) to provide deep-dives on individual holdings.
* **Groq with Gemini Fallback:** Automatically switches to Gemini's LLM if Groq (Llama-3.3-70B) experiences connection limits or API downtime.

### 6. Resilient & Safe System Architecture
* **Safe Redis Wrapper:** Intercepts Redis exceptions, allowing the server to gracefully degrade and serve cached or default values instead of crashing if Redis is offline.
* **Safe Price Event Streams:** Event-generator streams gracefully capture exceptions and fall back to regular ping intervals if the Redis pub/sub channel is interrupted.
* **Secure Auth with Clerk:** Migrated from legacy Auth0 authentication to **Clerk** (`@clerk/nextjs` frontend wrapper and cached JWKS verification in the backend).

---

## API Overview (Backend)

Base URL: `http://localhost:8000`

### Portfolio
* `GET /api/portfolio` – List all holdings for the authenticated user.
* `POST /api/portfolio` – Create a holding and queue background history backfills.
* `DELETE /api/portfolio/holding/{id}` – Remove a specific asset transaction lot.
* `GET /api/portfolio/history/{symbol}` – Retrieve transaction history lots for a specific symbol.

### Analytics
* `GET /api/analytics/portfolio` – Fetch consolidated risk, return, XIRR, and Monte Carlo outputs.
* `GET /api/analytics/history` – Fetch historical portfolio snapshots.

### Market Data
* `GET /api/market/mutualfunds?q=...` – Search for mutual funds.
* `GET /api/market/mutualfunds/{schemecode}` – Retrieve NAV history.
* `GET /api/market/stocks/india?symbol=...` – Fetch Indian stock price.
* `GET /api/market/stocks/us?symbol=...` – Fetch US stock price.
* `GET /api/market/crypto?symbol=...` – Fetch cryptocurrency price.

### Live Streaming
* `GET /api/stream/prices` – Server-Sent Events (SSE) stream of live prices from Redis.

### AI Endpoints
* `GET /api/ai/dost` – Ask AI Dost for a chat summary of the portfolio.
* `GET /api/ai/report` – Obtain a structured markdown analytical portfolio report.

*Note: All endpoints require a Clerk JWT token in the `Authorization: Bearer <token>` header.*

---

## Environment Configuration

### Backend `.env`
Create a `.env` file in the `backend/` directory and populate it with the following configuration details:

```bash
# PostgreSQL connection (asyncpg driver)
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Clerk Authentication (Get these from your Clerk Dashboard)
CLERK_API_URL=https://your-clerk-domain.clerk.accounts.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# External API Keys
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
FINNHUB_API_KEY=your_finnhub_key

# CORS Settings (frontend address)
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`
Create a `.env.local` file in the `frontend/` directory:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# API Keys (If client-side routes make direct calls)
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Backend Service API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed:
* Python 3.10+
* Node.js 18+
* PostgreSQL Database
* Redis Server

### 2. Backend (FastAPI) Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate.ps1
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure your environment variables
cp .env.example .env
# Open .env and fill in PostgreSQL, Redis, Clerk, and API Key credentials

# Run database migrations
alembic upgrade head

# Launch local dev server
uvicorn main:app --reload
```
The backend API documentation will be available at `http://localhost:8000/docs`.

### 3. Frontend (Next.js) Setup
```bash
cd frontend

# Install package dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Fill in Clerk key details and ensure NEXT_PUBLIC_API_URL matches your backend

# Launch Next.js dev server
npm run dev
```
Open `http://localhost:3000` in your browser to view the application dashboard.
