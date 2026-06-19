import asyncio
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/stream", tags=["stream"])

@router.get("/prices")
async def stream_prices():
    from core.redis import get_redis

    async def event_generator():
        try:
            redis = await get_redis()
            pubsub = redis.pubsub()
            await pubsub.subscribe("prices")
            while True:
                msg = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if msg and msg["type"] == "message":
                    yield f"data: {msg['data']}\n\n"
                else:
                    yield ": ping\n\n"
                await asyncio.sleep(0.1)
        except Exception as e:
            print(f"[SafeStream] Redis subscription unavailable: {e}")
            # Fallback to simple ping generator
            while True:
                yield ": ping\n\n"
                await asyncio.sleep(5)
        finally:
            try:
                if 'pubsub' in locals():
                    await pubsub.unsubscribe("prices")
            except Exception:
                pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )
