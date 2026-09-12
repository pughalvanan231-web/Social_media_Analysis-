# Gossip Protocol Backend

This is the backend for Gossip Protocol, an AI-powered social media intelligence platform.

## Setup Instructions

### 1. Database Configuration
By default, the backend uses a local SQLite database (`gossip_protocol.db`). 
To use PostgreSQL (recommended for production), update `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/gossip_protocol
```

To run migrations and initialize tables:
```bash
alembic upgrade head
```

### 2. Connectors Configuration

To ingest data from the official connectors, you need to configure the respective API keys in the `.env` file.

#### X (Twitter) Official API Setup
The application uses the official X API v2 `search/recent` endpoint. Scraping is not used.
1. Sign up for a [Twitter Developer Account](https://developer.twitter.com/en/portal/dashboard).
2. Create a new App and project.
3. Generate a **Bearer Token**.
4. Add it to your `.env` file:
   ```
   X_BEARER_TOKEN=your_token_here
   ```
> Note: If the token is not configured, the X connector API endpoints will gracefully return `{"available": false, "message": "X API access is not configured"}` instead of crashing or generating fake data.

#### YouTube Data API Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **YouTube Data API v3**.
3. Generate an API Key and add it to your `.env` file:
   ```
   YOUTUBE_API_KEY=your_key_here
   ```

#### Reddit Data API Setup
1. Go to your [Reddit App Preferences](https://www.reddit.com/prefs/apps).
2. Create a new app (select "script").
3. Your Client ID is the string under the app name. Your Client Secret is the "secret".
4. Add them to your `.env` file along with a custom User Agent to prevent rate-limiting:
   ```
   REDDIT_CLIENT_ID=your_client_id_here
   REDDIT_CLIENT_SECRET=your_client_secret_here
   REDDIT_USER_AGENT=script:gossip_protocol:v0.1.0
   ```
> Note: If these are not configured, the Reddit connector will gracefully return `{"available": false, "message": "Reddit API access is not configured"}` instead of crashing.

#### Bluesky Setup
The Bluesky connector currently uses the public, unauthenticated search endpoint. No API keys are required for basic usage, but note that public endpoints have strict rate limits.
```
BLUESKY_API_URL=https://public.api.bsky.app/xrpc
```
