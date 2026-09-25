import os
import asyncio
from datetime import datetime
from app.schemas.social import SocialPostCreate

try:
    from telethon.sync import TelegramClient
    from telethon.errors import SessionPasswordNeededError
    TELETHON_AVAILABLE = True
except ImportError:
    TELETHON_AVAILABLE = False

TELEGRAM_API_ID = os.getenv("TELEGRAM_API_ID", "")
TELEGRAM_API_HASH = os.getenv("TELEGRAM_API_HASH", "")
TELEGRAM_PHONE = os.getenv("TELEGRAM_PHONE", "") # Or bot token if using as bot

class TelegramApiNotConfiguredError(Exception):
    pass

def search_telegram_posts(channel_username: str, limit: int = 10) -> list:
    """
    Search Telegram posts from a specific public channel using Telethon.
    Note: Telegram doesn't have a global search API for bots/users, so we fetch recent posts from a target channel.
    """
    if not TELETHON_AVAILABLE:
        print("Telethon library not installed. Please run: pip install telethon")
        return []

    if not TELEGRAM_API_ID or not TELEGRAM_API_HASH:
        raise TelegramApiNotConfiguredError("Telegram API access is not configured in .env")

    saved_posts = []

    # Using a sync context with Telethon
    try:
        # Create a session file named 'telegram_session' in the backend root
        client = TelegramClient('telegram_session', int(TELEGRAM_API_ID), TELEGRAM_API_HASH)
        
        async def fetch_messages():
            await client.connect()
            if not await client.is_user_authorized():
                # For a seamless headless server, you usually log in once manually and keep the .session file.
                # If unauthorized, it will print a warning.
                print("Telegram client is not authorized. You need to run an interactive login script once.")
                return []
                
            messages = []
            async for message in client.iter_messages(channel_username, limit=limit):
                messages.append(message)
            return messages

        # Run the async fetch within a sync function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        messages = loop.run_until_complete(fetch_messages())
        loop.close()

        for msg in messages:
            if not msg.text:
                continue # Skip media-only messages without text
                
            source_id = str(msg.id)
            text = msg.text
            created_at = msg.date # This is already a datetime object (UTC)
            
            # Telegram engagement metrics
            views = getattr(msg, 'views', 0) or 0
            shares = getattr(msg, 'forwards', 0) or 0
            
            url = f"https://t.me/{channel_username}/{source_id}"
            
            post_create = SocialPostCreate(
                platform="telegram",
                source_post_id=source_id,
                text=text.strip(),
                created_at=created_at,
                language=None,
                url=url,
                likes=0, # Telegram uses reactions, which are complex to parse in basic iter_messages
                comments=0, 
                shares=shares,
                views=views,
                author_username=channel_username, # Channel name is the author
                hashtags=[] 
            )
            saved_posts.append(post_create)

    except Exception as e:
        print(f"Error calling Telegram API: {e}")
    finally:
        if 'client' in locals() and client.is_connected():
            client.disconnect()

    return saved_posts
