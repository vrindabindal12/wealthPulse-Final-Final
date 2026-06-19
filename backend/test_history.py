import asyncio
import os
import sys

# Add backend root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import AsyncSessionLocal
from api.stock_compat import _get_price_series, _compute_analytics
from core.redis import init_redis, get_redis

async def main():
    await init_redis()
    redis = await get_redis()
    async with AsyncSessionLocal() as db:
        try:
            print("Fetching price series...")
            series = await _get_price_series("TCS.NS", db, redis)
            print("Series fetched successfully, size:", len(series))
            if series:
                print("Computing analytics...")
                df = _compute_analytics(series)
                print("Computed df rows:", len(df))
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
