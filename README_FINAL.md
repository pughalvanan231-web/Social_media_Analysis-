# GOSSIP PROTOCOL

**"A cross-platform early-signal intelligence system that transforms noisy public social-media activity into explainable emerging-issue alerts."**

## A. Build and Start Commands

The application requires Python 3 for the backend and Node.js for the frontend.

### 1. Backend (FastAPI + SQLite)
Navigate to the `backend` directory.
```bash
# Setup virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows

# Install requirements
pip install -r requirements.txt

# Initialize Database and Run Migrations
alembic upgrade head

# Seed necessary initial data (Users & Mock Configs)
python seed_users.py

# Start the server
uvicorn app.main:app --reload --port 8000
```
*The backend will be running at `http://127.0.0.1:8000`*

### 2. Frontend (React + Vite)
Navigate to the `frontend` directory.
```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Or build for production
npm run build
npm run preview
```
*The frontend will be running at `http://localhost:5173`*

## B. Environment Variables Required

**Backend (`backend/.env`)**
```env
# Core API Settings
DATABASE_URL=sqlite:///./gossip_protocol.db
SECRET_KEY=generate_a_secure_random_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Note: External APIs (X, Reddit, Bluesky, YouTube) are structurally supported via connectors 
# but are NOT required to run the Demo Mode or the internal intelligence engine.
```

**Frontend (`frontend/.env`)**
No external environment variables are strictly necessary for local development; it defaults to the local backend port 8000.

## C. Demo Credentials

If authentication is enabled, you can use the default seeded analyst account:
- **Username:** `admin` (or `analyst1`)
- **Password:** `admin123`

## D. Demo Scenario Names

A comprehensive "Demo Mode" is built into the frontend (accessible via the floating `★` button). It allows you to reliably showcase the *actual* backend intelligence pipeline even without live API credentials.

1. **Urban Water Supply Disruption**
2. **Transport Service Disruption**
3. **Emerging Public Health Issue**

*Selecting a scenario wiping the current active alerts, seeds synthetic raw posts directly into the backend, and routes them through the real analysis pipeline.*

## E. Main API Endpoints

- `POST /api/demo/run?scenario_id=X` : Wipes state and seeds a demo scenario into the intelligence engine.
- `GET /api/issues` : Retrieves ranked emerging issues.
- `GET /api/issues/{id}` : Retrieves details for a specific issue.
- `GET /api/issues/{id}/signals` : Retrieves the intelligence signals (growth, sentiment shift, etc.) that triggered the issue.
- `GET /api/issues/{id}/correlation` : Returns the cross-platform breakdown of the issue.
- `GET /api/issues/{id}/evidence` : Returns the representative raw posts supporting the detection.
- `GET /api/alerts` : Retrieves human-readable, explainable alerts.
- `POST /api/reports` : Generates and returns a strictly formatted 12-section PDF Intelligence Report distinguishing observed data from system analysis.

## F. Final Architecture

Gossip Protocol relies on a unidirectional data flow specifically designed to prevent "noisy" data from instantly triggering alerts.

1. **Social Sources**: Configurable data connectors (X, Reddit, YouTube, Bluesky).
2. **Data Collection**: Asynchronous background ingestion.
3. **Normalization**: Structuring raw data into a universal `SocialPost` model (sentiment, topic association).
4. **NLP Analysis**: Topic grouping and keyword extraction.
5. **Trend Detection**: Snapshot generation comparing current activity against historical baselines.
6. **Intelligence Engine**: A multi-variate scoring system. Calculates signal strength based on normalized components (Activity volume + Statistical Anomaly + Sentiment Shift + Topic Growth) so that no single metric can dominate unfairly.
7. **Explainable Alerts**: Transforms threshold-breaking anomalies into human-readable alerts pointing directly back to the triggering evidence.

*Infrastructure is kept extremely lightweight utilizing purely Python, FastAPI, React, and SQLite for ultimate hackathon portability.*

## G. Known Limitations

- **Production Database**: SQLite is utilized for portability. A production deployment would require migrating the SQLAlchemy models to PostgreSQL to handle concurrent high-volume streaming inserts.
- **NLP Mocking**: Deep sentiment analysis and dynamic cross-platform clustering heavily utilize synthetic / mocked layers in the demo environment to ensure stability without external, paid LLM API constraints.
- **Geospatial Precision**: Geographic signals are purely inferred from high-level metadata (e.g., City/State strings) rather than precise GPS coordinates, which are rarely available on public social APIs.
