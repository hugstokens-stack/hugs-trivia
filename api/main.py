from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from random import choice

app = Flask(__name__)
CORS(app)

@app.get("/api/health")
def health():
    return jsonify({"ok": True})

@app.get("/api/question")
def question():
    level = int(request.args.get("level", 1))
    bank = [
        ("What color is the sky?", "blue"),
        ("Capital of France?", "Paris"),
        ("How many days are in a week?", "7"),
        ("Fastest land animal?", "cheetah"),
        ("Who painted the Mona Lisa?", "leonardo da vinci"),
    ]
    q, a = choice(bank)
    return jsonify({"level": level, "question": q, "answer": a})

@app.post("/api/reward")
def reward():
    data = request.get_json(force=True) or {}
    address = data.get("address")
    amount = int(data.get("amount", 0))
    token = data.get("token", "HUGS")
    if not address or amount <= 0:
        return jsonify({"ok": False, "error": "invalid params"}), 400

    # MOCK by default – flip to XRPL by setting REWARDS_MODE=XRPL and adding creds
    mode = os.getenv("REWARDS_MODE", "MOCK").upper()
    if mode == "MOCK":
        return jsonify({"ok": True, "mode": "MOCK", "to": address, "amount": amount, "token": token})

    return jsonify({"ok": False, "error": "XRPL not configured"}), 501
