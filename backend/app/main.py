import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.database.connection import engine
import app.models.base as models
import app.models.social # Import to ensure models are registered with Base

from app.api import auth

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Gossip Protocol API",
    description="AI-Powered Social Media Intelligence",
    version="0.1.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import posts, connectors, pipeline, ai, intelligence, trends, issues, network, geo, alerts, investigate, dashboard, reports, feedback

from fastapi import Depends
from app.api.deps import get_current_user, RequireRole

# Create all tables (in MVP mode)
models.Base.metadata.create_all(bind=engine)

# Public
app.include_router(auth.router)

# Protected
protected = [Depends(get_current_user)]

app.include_router(posts.router, dependencies=protected)
app.include_router(connectors.router, dependencies=protected)
app.include_router(pipeline.router, dependencies=protected)
app.include_router(ai.router, dependencies=protected)
app.include_router(intelligence.router, dependencies=protected)
app.include_router(trends.router, dependencies=protected)
app.include_router(issues.router, dependencies=protected)
app.include_router(network.router, dependencies=protected)
app.include_router(geo.router, dependencies=protected)
app.include_router(alerts.router, dependencies=protected)
app.include_router(investigate.router, dependencies=protected)
app.include_router(dashboard.router, dependencies=protected)
app.include_router(reports.router, dependencies=[Depends(RequireRole(["ADMIN", "DECISION_MAKER"]))])
app.include_router(feedback.router, dependencies=[Depends(RequireRole(["ADMIN", "ANALYST"]))])

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "Gossip Protocol"
    }
