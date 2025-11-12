# api/main.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import os, json, time
from random import choice
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ─────────────────────────── Config ───────────────────────────
REWARDS_MODE = os.getenv("REWARDS_MODE", "MOCK").upper()  # MOCK or XRPL (future)
TOKEN_CODE = os.getenv("XRPL_TOKEN_CODE", "HUGS")
LEDGER_FILE = "/tmp/hugs_ledger.jsonl"   # simple append-only log for mock mode

# ─────────────────────── Helpers: mock ledger ─────────────────
def _append_ledger(entry: dict):
    """Append a JSON line to the local ledger file (mock mode)."""
    entry.setdefault("token", TOKEN_CODE)
    entry.setdefault("ts", time.time())
    os.makedirs(os.path.dirname(LEDGER_FILE), exist_ok=True)
    with open(LEDGER_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

def _read_ledger():
    """Read all entries from the ledger; tolerant to partial lines."""
    if not os.path.exists(LEDGER_FILE):
        return []
    out = []
    with open(LEDGER_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                out.append(json.loads(line))
            except Exception:
                # skip malformed line
                pass
    return out

def _compute_balance(address: str, token: str = TOKEN_CODE) -> float:
    """Sum rewards to an address for a token (mock mode)."""
    total = 0.0
    for e in _read_ledger():
        if e.get("to") == address and e.get("token") == token:
            # we only record positive rewards in mock mode
            try:
                total += float(e.get("amount", 0))
            except Exception:
                pass
    return total

# ───────────────────────── Health ─────────────────────────────
@app.get("/api/health")
def health():
    return jsonify({"ok": True, "mode": REWARDS_MODE, "token": TOKEN_CODE})

# ───────────────────────── Questions ──────────────────────────
@app.get("/api/question")
def question():
    level = int(request.args.get("level", 1))

    # Tiny demo bank (frontend now has the larger bank & no-repeat logic)
    bank = [
        ("What color is the sky?", "blue"),
        ("Capital of France?", "paris"),
        ("How many days are in a week?", "7"),
        ("Fastest land animal?", "cheetah"),
        ("Who painted the Mona Lisa?", "leonardo da vinci"),
    ]
    q, a = choice(bank)
    return jsonify({"level": level, "question": q, "answer": a})

# ─────────────────────── Rewards (mock) ───────────────────────
@app.post("/api/reward")
def reward():
    data = request.get_json(force=True) or {}
    address = (data.get("address") or "").strip()
    amount = data.get("amount", 0)
    token = (data.get("token") or TOKEN_CODE).strip() or TOKEN_CODE
    reason = (data.get("reason") or "").strip()

    try:
        amount = float(amount)
    except Exception:
        amount = 0

    if not address or amount <= 0:
        return jsonify({"ok": False, "error": "invalid params"}), 400

    # MOCK mode: just log the reward as if it was paid
    if REWARDS_MODE == "MOCK":
        entry = {
            "type": "reward",
            "to": address,
            "amount": amount,
            "token": token,
            "reason": reason,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
        _append_ledger(entry)
        # "tx_hash" is synthetic in mock mode
        tx_hash = f"mock-{int(time.time()*1000)}"
        return jsonify({"ok": True, "mode": "MOCK", "tx_hash": tx_hash, **entry})

    # XRPL mode not wired yet
    return jsonify({"ok": False, "error": "XRPL not configured"}), 501

# ─────────────────────── Balance & History ────────────────────
@app.get("/api/balance")
def balance():
    address = (request.args.get("address") or "").strip()
    if not address:
        return jsonify({"error": "Missing address"}), 400

    if REWARDS_MODE == "MOCK":
        bal = _compute_balance(address, TOKEN_CODE)
        return jsonify({"ok": True, "token": TOKEN_CODE, "balance": bal})

    return jsonify({"ok": False, "error": "XRPL not configured"}), 501

@app.get("/api/history")
def history():
    """Return recent rewards for an address (mock)."""
    address = (request.args.get("address") or "").strip()
    limit = int(request.args.get("limit", 50))
    if not address:
        return jsonify({"error": "Missing address"}), 400

    rows = []
    if REWARDS_MODE == "MOCK":
        for e in reversed(_read_ledger()):
            if e.get("to") == address and e.get("token") == TOKEN_CODE:
                rows.append(e)
                if len(rows) >= limit:
                    break
        return jsonify({"ok": True, "token": TOKEN_CODE, "items": rows})

    return jsonify({"ok": False, "error": "XRPL not configured"}), 501
