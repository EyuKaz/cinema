from fastapi import FastAPI
from fastapi.responses import JSONResponse
import redis, os

app = FastAPI(title="Cinema-Recommendations", version="1.0.0")
r = redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379"))

@app.get("/api/recommendations/{movie_id}")
def recommend(movie_id: int):
    cached = r.get(f"rec:{movie_id}")
    if cached:
        return JSONResponse(content={"source": "cache", "data": cached.decode()})
    # dummy response; replace with real NearestNeighbors logic
    data = [movie_id + 1, movie_id + 2, movie_id + 3]
    r.setex(f"rec:{movie_id}", 3600, str(data))
    return {"source": "model", "data": data}

@app.get("/health")
def health():
    return {"status": "ok"}