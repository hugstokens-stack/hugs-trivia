from dotenv import load_dotenv
import os
import tweepy
import time

# --- Load environment ---
load_dotenv()

X_API_KEY       = (os.getenv("X_API_KEY") or "").strip()
X_API_SECRET    = (os.getenv("X_API_SECRET") or "").strip()
X_ACCESS_TOKEN  = (os.getenv("X_ACCESS_TOKEN") or "").strip()
X_ACCESS_SECRET = (os.getenv("X_ACCESS_SECRET") or "").strip()
X_BEARER_TOKEN  = (os.getenv("X_BEARER_TOKEN") or "").strip()

if not all([X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET]):
    raise RuntimeError("❌ Missing X credentials. Check your .env values.")

# --- Authenticate with Tweepy client (v2) ---
client = tweepy.Client(
    bearer_token=X_BEARER_TOKEN,
    consumer_key=X_API_KEY,
    consumer_secret=X_API_SECRET,
    access_token=X_ACCESS_TOKEN,
    access_token_secret=X_ACCESS_SECRET
)

# --- Verify connection and identify bot ---
try:
    me = client.get_me()
    BOT_HANDLE = me.data["username"].lower()
    BOT_USER_ID = str(me.data["id"])
    print(f"✅ Authenticated as: {BOT_HANDLE}")
except Exception as e:
    print("❌ Authentication failed:", e)
    BOT_HANDLE = "unknown"
    BOT_USER_ID = "0"

print("✅ Environment loaded successfully!")

# --- Function to post to X ---
def post_to_x(text: str) -> int:
    try:
        resp = client.create_tweet(text=text)
        tweet_id = resp.data["id"]
        print(f"✅ Posted to X tweet_id={tweet_id}")
        return tweet_id
    except Exception as e:
        print("❌ Failed to post to X:", e)
        return -1

# --- Export names for main.py ---
__all__ = ["client", "BOT_HANDLE", "BOT_USER_ID", "post_to_x"]

