from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine
import app.models.base as models
import app.models.social # Import to ensure models are registered with Base

app = FastAPI(
    title="Gossip Protocol API",
    description="AI-Powered Social Media Intelligence",
    version="0.1.0"
)

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import posts, connectors, pipeline, ai, intelligence, trends, issues, network, geo, alerts, investigate, dashboard, reports, feedback

# Create all tables (in MVP mode)
models.Base.metadata.create_all(bind=engine)

app.include_router(posts.router)
app.include_router(connectors.router)
app.include_router(pipeline.router)
app.include_router(ai.router)
app.include_router(intelligence.router)
app.include_router(trends.router)
app.include_router(issues.router)
app.include_router(network.router)
app.include_router(geo.router)
app.include_router(alerts.router)
app.include_router(investigate.router)
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(feedback.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "Gossip Protocol"
    }
