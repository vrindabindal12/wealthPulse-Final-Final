from pydantic_settings import BaseSettings
from pydantic import model_validator


class Settings(BaseSettings):
    # ── Database (PostgreSQL via asyncpg) ─────────────────────────────────────
    DATABASE_URL: str = ""
    DATABASE_URL_SYNC: str = ""

    # ── Cache ─────────────────────────────────────────────────────────────────
    REDIS_URL: str = ""

    # ── Clerk ─────────────────────────────────────────────────────────────────
    CLERK_API_URL: str = ""                         # e.g. https://clerk-domain.clerk.accounts.dev

    # ── External APIs ─────────────────────────────────────────────────────────
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    FINNHUB_API_KEY: str = ""

    # ── CORS ──────────────────────────────────────────────────────────────────
    FRONTEND_URL: str = "https://wealthpulse.vercel.app"  # override with your real Vercel URL

    @model_validator(mode="after")
    def derive_sync_url(self):
        if not self.DATABASE_URL_SYNC:
            self.DATABASE_URL_SYNC = self.DATABASE_URL.replace(
                "postgresql+asyncpg://", "postgresql://"
            )
        return self

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
