# WealthPulse

WealthPulse is an AI-powered portfolio cockpit for retail investors. Track stocks, mutual funds, and crypto in one place, see real risk/return analytics, and get conversational guidance from your AI companions.

---

## 🌟 Key Features

* **Consolidated Portfolio Tracker**
  - Add stocks, mutual funds, and crypto with buy price, quantity, and buy date.
  - View aggregated holding positions (average buy price, total quantities, current values) instead of scattered lots.
  - Check transaction buy history with lot details in a dedicated breakdown modal.
  - Interactive per-holding and overall P&L, XIRR, and transaction timelines.

* **Premium Light Theme Design**
  - Modern, clean user interface styled around the signature `#F5F5F5` light gray background and high-contrast dark typography.
  - Dynamic elements featuring card containers (`bg-white`) with fine borders (`border-black/5`) and micro-animations on hover.
  - Global, responsive navigation bar (`Navbar.jsx`) that dynamically updates typography weights and colors depending on light/dark modes of active routes.

* **Real Market Behaviour & Integrations**
  - Live price feeds via:
    - **Binance WebSocket** (Crypto → Redis).
    - **Finnhub WebSocket** (US Stocks → Redis).
    - **yfinance polling** (Indian Stocks → Redis).
  - Mutual Fund NAVs parsed directly from AMFI text documents and cached for swift retrieval.
  - Daily historical price series backfill to enable detailed analytics.

* **Portfolio Risk & Performance Metrics**
  - Annualized volatility, Sharpe ratios (using a 5% risk-free rate), and maximum drawdown calculations.
  - 1-Year Monte Carlo simulations for each holding (simulated expected NAV/price, upper/lower bounds, and positive return probabilities).
  - Daily portfolio snapshot logs to chart historical net asset value (NAV) over time.

* **AI Assistants**
  - **AI Dost**: A friendly, responsive chatbot that offers portfolio analysis and suggestions in simple language. Includes suggestions chips and smooth auto-scrolling interfaces.
  - **AI Report**: A structured, detailed investment analysis report containing asset allocations, risk ratings, and growth projections.
  - Support for streaming LLM outputs powered by Groq (Llama-3.3-70B) with automatic Google Gemini fallbacks.

---

## 🏗️ System Architecture & Data Flow

WealthPulse is built on a high-throughput, decoupled architecture consisting of an asynchronous API backend, a real-time cache layer, dynamic data ingest workers, and a modern single-page frontend.

```mermaid
graph TD
    %% Frontend and Auth
    User([User Browser]) -->|Next.js App Router| FE[Next.js Frontend]
    FE -->|Auth Session| Clerk[Clerk Auth Platform]
    
    %% API and Cache
    FE -->|API Requests + JWT| BE[FastAPI Backend]
    BE -->|Read/Write Session Cache| Redis[(Redis In-Memory Cache)]
    BE -->|Async DB Queries| Postgres[(PostgreSQL DB)]
    BE -->|LLM Prompts| LLM[Groq / Gemini API]

    %% Live Ingest Workers
    BinanceWS[Binance WS Worker] -->|Live Crypto Prices| Redis
    FinnhubWS[Finnhub WS Worker] -->|Live US Stock Prices| Redis
    YFWorker[yfinance Polling Worker] -->|Live India Stock Prices| Redis
    AMFICron[AMFI NAV Cron Job] -->|Daily NAV Backfill| Postgres
    AMFICron -->|Latest NAV Cache| Redis
```

### Components

1. **Frontend (Next.js)**: Built using React, Tailwind CSS, and GSAP for micro-animations. Connects to Clerk for client-side authentication and queries the backend for portfolio metrics, charts, and AI completions.
2. **Backend (FastAPI)**: Formulates an asynchronous python API layer using SQLAlchemy and `asyncpg`. Integrates Clerk JWT verification middleware to secure portfolio data.
3. **Database (PostgreSQL)**: Acts as the persistent storage layer for transactions, user profiles, historical prices, and daily snapshots.
4. **Cache & Streaming (Redis)**: Acts as a real-time key-value cache and a message broker. Feeds client price streams via Server-Sent Events (SSE).
5. **Background Ingestion Workers**:
   - `binance_ws.py`: Subscribes to Binance stream to push live crypto prices into Redis.
   - `finnhub_ws.py`: Streams live US equity ticks from Finnhub directly into Redis.
   - `india_stocks.py`: Periodically queries Indian equities via `yfinance` to cache prices.
   - `amfi_cron.py`: Scheduled task that parses official daily NAV lists from the Association of Mutual Funds in India (AMFI) to populate `price_history` and cache Navs.

---

## 🗄️ Database Schema Design

The Postgres database tables are defined using SQLAlchemy declarative models:

### 1. `users` Table
Stores user credentials linked to Clerk authentication.
* `id` (`Text`, Primary Key) - The user's unique Clerk subject ID (`sub`).
* `email` (`Text`, Unique, Not Null) - User email address.
* `created_at` (`TIMESTAMP with Timezone`) - User creation timestamp.

### 2. `holdings` Table
Tracks individual asset buy transactions (lots) for each portfolio.
* `id` (`UUID`, Primary Key) - Auto-generated unique lot transaction ID.
* `user_id` (`Text`, Not Null) - Owner identification tag matching the user ID.
* `symbol` (`Text`, Not Null) - Market ticker symbol (e.g., `RELIANCE.NS`, `BTCUSDT`, or AMFI scheme code `120503`).
* `name` (`Text`, Not Null) - Asset or security name.
* `asset_type` (`Text`, Not Null) - Categorization tag: `stock`, `mutual_fund`, or `crypto`.
* `buy_price` (`Numeric(18, 6)`, Not Null) - Price per unit at purchase.
* `quantity` (`Numeric(18, 6)`, Not Null) - Total units purchased.
* `buy_date` (`Date`, Not Null) - Date of the trade.
* `created_at` (`TIMESTAMP with Timezone`) - Auto-generated creation time.

### 3. `price_history` Table
Stores daily close prices for calculating advanced metrics (Sharpe ratio, volatility, maximum drawdown, Monte Carlo simulations).
* `symbol` (`Text`, Composite Primary Key) - Ticker symbol.
* `price_date` (`Date`, Composite Primary Key) - The trading date.
* `asset_type` (`Text`, Not Null) - Type of asset.
* `close_price` (`Numeric(18, 6)`, Not Null) - Adjusted closing price on the date.

### 4. `portfolio_snapshots` Table
Logs daily aggregate metrics of a user's portfolio over time to draw historical NAV charts.
* `id` (`UUID`, Primary Key) - Unique snapshot record ID.
* `user_id` (`Text`, Not Null) - Associated user ID.
* `snapshot_date` (`Date`, Not Null) - Captured date.
* `total_value` (`Numeric(18, 2)`) - Combined asset evaluation.
* `total_cost` (`Numeric(18, 2)`) - Net cost basis of portfolio.
* `breakdown` (`JSONB`) - Structured asset-level details on that specific date.
* *Constraint*: Unique index on `(user_id, snapshot_date)`.

---

## ⚡ Redis & Caching Strategy

Redis is utilized as a real-time data layer and performance optimization layer to minimize database load and external API query limits:

### 1. Real-Time Price Caching
Inbound live workers write prices to key structures in Redis:
- **Crypto**: `crypto:{symbol}` (TTL: None, updated via WebSocket tick).
- **US Stocks**: `stock:us:{symbol}` (TTL: None, updated via WebSocket tick).
- **Indian Stocks**: `stock:in:{symbol}` (TTL: None, updated via polling).
- **Mutual Funds**: `nav:{scheme_code}` (TTL: None, updated daily by AMFI script).

When users fetch their dashboards, current prices are retrieved in O(1) time directly from Redis, bypassing database or network lookups.

### 2. Live SSE Price Streaming
The endpoint `/api/stream/prices` sets up a Server-Sent Events (SSE) stream. It reads real-time price messages from Redis and streams live valuation updates directly to the frontend interface.

### 3. Analytics & Simulation Caching
Advanced calculations are cached in Redis to keep page load times fast:
- **Monte Carlo Simulations**: Pre-calculated forecasts are cached at `mc:{user_id}:{symbol}` (TTL: 6 hours).
- **Mutual Fund Scheme Lists**: Searches are cached at `mf:search:{query}` (TTL: 1 hour) and metadata at `mf:meta:{scheme_code}` (TTL: 1 hour).
- **NAV Historical Series**: Re-calculating NAV charts reads cached structures at `mf:series:{scheme_code}` (TTL: 30 minutes).

---

## 🔐 Authentication Architecture

WealthPulse uses **Clerk** for modern, secure identity management.
* **Frontend**: Wrapped globally at the layout level (`layout.js`) to secure client-side pages.
* **Backend**: FastAPI middleware validates session tokens supplied in the HTTP request headers (`Authorization: Bearer <token>`).

---

## 🛠️ Environment Configuration

### Backend `.env`

Copy `.env.example` to `.env` and fill in:

```bash
# ── PostgreSQL Database Connection ───────────────────────────────
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/wealthpulse
DATABASE_URL_SYNC=postgresql://postgres:password@localhost:5432/wealthpulse

# ── Cache Layer ──────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379/0

# ── Clerk Configuration ──────────────────────────────────────────
CLERK_API_URL=https://your-clerk-instance-id.accounts.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# ── Large Language Models & APIs ─────────────────────────────────
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
FINNHUB_API_KEY=your_finnhub_api_key

# ── CORS Settings ────────────────────────────────────────────────
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env`

Create `.env` inside the `frontend` folder and fill in:

```bash
# ── Clerk Authentication Configuration ──────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# ── API Keys & Backends ──────────────────────────────────────────
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/vrindabindal12/wealthPulse-Final-Final.git
cd wealthpulse-v2
```

### 2. Backend (FastAPI) Setup

```bash
cd backend

# Create and activate a python virtual environment
python -m venv venv
# On Windows:
source venv/Scripts/activate
# On macOS/Linux:
source venv/bin/activate

# Install package dependencies
pip install -r requirements.txt

# Configure your environment
cp .env.example .env
# Edit .env with your PostgreSQL, Redis, Clerk, and LLM credentials

# Run database migrations
alembic upgrade head

# Start the uvicorn development server
uvicorn main:app --reload
```
The backend server will run on `http://localhost:8000`.

### 3. Frontend (Next.js) Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start the next development server
npm run dev
```
The frontend will run on `http://localhost:3000`. Hot module replacement (HMR) is active.

---

## 🗺️ API Endpoints Summary

### Portfolio Management
* `GET /api/portfolio` - Fetch holdings list.
* `POST /api/portfolio` - Add asset lot (symbol, quantity, buy price, asset type, buy date).
* `DELETE /api/portfolio/holding/{id}` - Delete asset lot or holding.
* `GET /api/portfolio/history/{symbol}` - Retrieve full transaction history for a specific symbol.

### Financial Analytics
* `GET /api/analytics/portfolio` - Aggregated portfolio metrics (risk analysis, Monte Carlo, combined values, performance summaries).
* `GET /api/analytics/history` - Historical portfolio NAV snapshots over time.

### Market Data APIs
* `GET /api/market/mutualfunds` - Search Indian Mutual Funds database.
* `GET /api/market/mutualfunds/{schemecode}` - Fetch fund details & price history.
* `GET /api/market/stocks/india` - Indian stock price query.
* `GET /api/market/stocks/us` - US stock price query.
* `GET /api/market/crypto` - Cryptocurrency price query.
* `GET /api/stream/prices` - Server-Sent Events (SSE) price stream.

### AI Endpoints
* `GET /api/ai/dost` - Conversational portfolio review.
* `GET /api/ai/report` - Generate detailed Markdown research reports.
