# main.py
import time
import re
from typing import Dict, Tuple, List

# Reuse your X client + helpers from x_adapter.py
# (BOT_HANDLE and BOT_USER_ID should be defined in x_adapter.py)
from x_adapter import post_to_x, client, BOT_HANDLE, BOT_USER_ID
from trivia_generators import generate_question

# ---------------- Config ----------------
WAIT_FOR_REPLIES_SEC = 120     # how long to wait before grading a round (seconds)
MAX_FETCH_ATTEMPTS   = 1       # keep at 1 on Free tier to avoid 429
CATEGORIES           = ["general", "american_music", "pop_culture", "old_commercials"]
LEVELS               = [1, 2, 3, 4, 5]

# Keep answers by tweet_id so we can grade replies
ACTIVE_ROUNDS: Dict[int, Dict[str, object]] = {}  # tweet_id -> {"answer": str, "category": str, "level": int, "posted_at": float}

# ---------------- Utilities ----------------
def normalize(text: str) -> str:
    """Lowercase and strip punctuation/extra spaces for fair matching."""
    t = text.lower()
    t = re.sub(r"[^a-z0-9]+", " ", t).strip()
    return t

def build_tweet_text(level: int, category: str, q: str) -> str:
    return (
        f"🎯 Level {level} · {category.title()} Trivia\n"
        f"{q}\n\nReply with your answer!"
    )

# ---------------- Post one round ----------------
def post_round(level: int = 1, category: str = "general") -> int:
    q, answer = generate_question(category, level)
    text = build_tweet_text(level, category, q)

    tweet_id = post_to_x(text)
    if tweet_id == -1:
        print("⚠️ Round not posted.")
        return -1

    ACTIVE_ROUNDS[int(tweet_id)] = {
        "answer": normalize(answer),
        "category": category,
        "level": level,
        "posted_at": time.time(),
    }
    print(f"✅ Round posted. tweet_id={tweet_id}  answer='{answer}'")
    return int(tweet_id)

# ---------------- Fetch replies once (v2 search) ----------------
def fetch_replies_once(tweet_id: int) -> List[Tuple[int, str, str]]:
    """
    Pull recent replies to this tweet using v2 search on conversation_id.
    Returns list of (reply_id, '@handle', text).
    """
    try:
        q = f"conversation_id:{tweet_id}"
        resp = client.search_recent_tweets(
            query=q,
            expansions=["author_id", "in_reply_to_user_id"],
            tweet_fields=["in_reply_to_user_id", "created_at", "conversation_id"],
            user_fields=["username"],
            max_results=50,
        )
        tweets = resp.data or []
        users = {u.id: u for u in (resp.includes.get("users", []) if resp.includes else [])}

        results: List[Tuple[int, str, str]] = []
        for t in tweets:
            # Only consider replies directed to our bot (defensive)
            if getattr(t, "in_reply_to_user_id", None) != BOT_USER_ID:
                continue
            author = users.get(t.author_id)
            handle = f"@{author.username}" if author else "@unknown"
            results.append((t.id, handle, t.text))
        return results
    except Exception as e:
        print("⚠️ fetch_replies error:", e)
        return []

# ---------------- Grade a round ----------------
def grade_round(tweet_id: int):
    round_info = ACTIVE_ROUNDS.get(tweet_id)
    if not round_info:
        print("No such round.")
        return

    correct = round_info["answer"]
    replies = fetch_replies_once(tweet_id)

    # Find first exact (normalized) match
    for rid, handle, text in replies:
        if normalize(text) == correct:
            try:
                client.create_tweet(
                    text=f"🏆 {handle} got it! Answer: {correct}",
                    in_reply_to_tweet_id=tweet_id
                )
                print(f"🏆 Winner: {handle}")
            except Exception as e:
                print("⚠️ announce error:", e)
            ACTIVE_ROUNDS.pop(tweet_id, None)
            return

    print("No correct answers yet.")

# ---------------- Run once ----------------
if __name__ == "__main__":
    # Post a single round (fixed L1/general for now; you can randomize later)
    tid = post_round(level=1, category="general")
    if tid != -1:
        time.sleep(WAIT_FOR_REPLIES_SEC)   # give people time to answer
        grade_round(tid)




