import sqlite3
from datetime import datetime

DB_PATH = "hugs.db"

def _conn():
    return sqlite3.connect(DB_PATH)

def init_db():
    conn = _conn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            hugs INTEGER DEFAULT 0,
            correct_answers INTEGER DEFAULT 0,
            last_played TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS rounds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            level INTEGER,
            question TEXT,
            answer TEXT,
            posted_at TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            round_id INTEGER,
            username TEXT,
            reply TEXT,
            correct INTEGER DEFAULT 0,
            responded_at TEXT,
            UNIQUE(round_id, username)
        )
    """)
    conn.commit()
    conn.close()

def record_round(category, level, question, answer) -> int:
    conn = _conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO rounds (category, level, question, answer, posted_at) VALUES (?, ?, ?, ?, ?)",
        (category, int(level), question, answer, datetime.utcnow().isoformat()),
    )
    rid = cur.lastrowid
    conn.commit()
    conn.close()
    return rid

def record_response(round_id, username, reply, correct):
    conn = _conn()
    cur = conn.cursor()
    cur.execute("INSERT OR IGNORE INTO players (username) VALUES (?)", (username,))
    cur.execute("""
        INSERT OR IGNORE INTO responses (round_id, username, reply, correct, responded_at)
        VALUES (?, ?, ?, ?, ?)
    """, (round_id, username, reply, int(bool(correct)), datetime.utcnow().isoformat()))
    if correct:
        cur.execute("""
            UPDATE players
            SET hugs = hugs + 5,
                correct_answers = correct_answers + 1,
                last_played = ?
            WHERE username = ?
        """, (datetime.utcnow().isoformat(), username))
    else:
        cur.execute("UPDATE players SET last_played = ? WHERE username = ?", (datetime.utcnow().isoformat(), username))
    conn.commit()
    conn.close()

def leaderboard(limit=10):
    conn = _conn()
    cur = conn.cursor()
    cur.execute("SELECT username, hugs, correct_answers FROM players ORDER BY hugs DESC, correct_answers DESC LIMIT ?", (limit,))
    rows = cur.fetchall()
    conn.close()
    return rows

