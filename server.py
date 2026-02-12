# server.py — “22 Seconds” backend (robust faucet + activation + trustline + rewards)
# Works with xrpl-py 1.x–4.x

import os
import time
import requests
from typing import Tuple, Union, Dict, Any, Optional

from flask import Flask, jsonify, request
from flask_cors import CORS

from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.transaction import autofill, sign
from xrpl.models.requests import AccountInfo, AccountLines
from xrpl.models.transactions import Payment, TrustSet, TrustSetFlag
from xrpl.models.amounts import IssuedCurrencyAmount

try:
    from xrpl.transaction import send_reliable_submission
except ImportError:
    from xrpl.transaction import submit_and_wait as send_reliable_submission  # type: ignore

# ── Environment ───────────────────────────────────────────────────────────────
XRPL_RPC = os.getenv("XRPL_RPC_URL", os.getenv("XRPL_RPC", "https://s.altnet.rippletest.net:51234"))
ISSUER = (os.getenv("ISSUER_ADDRESS") or os.getenv("ISSUER") or "").strip()
TOKEN = (os.getenv("TOKEN_CODE") or os.getenv("TOKEN") or "HUGS").strip()
REWARD_PER_WIN = int(os.getenv("REWARD_PER_WIN", "5"))
ISSUER_SEED = (os.getenv("ISSUER_SEED") or "").strip()

client = JsonRpcClient(XRPL_RPC)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── Helpers ──────────────────────────────────────────────────────────────────
def sign_and_submit(tx, wallet: Wallet, _client: JsonRpcClient) -> Any:
    tx = autofill(tx, _client)
    signed = sign(tx, wallet)
    return send_reliable_submission(signed, _client)

def is_account_activated(address: str) -> bool:
    """Return True if the account exists on-ledger."""
    try:
        _ = client.request(AccountInfo(account=address, ledger_index="validated", strict=True)).result
        return True
    except Exception:
        return False

def wait_for_activation(address: str, seconds: int = 12) -> bool:
    """Poll for activation up to `seconds` (roughly 1–2 ledgers)."""
    deadline = time.time() + seconds
    while time.time() < deadline:
        if is_account_activated(address):
            return True
        time.sleep(1.2)
    return False

def faucet_fund_testnet(destination: str) -> Tuple[bool, Union[Dict[str, Any], str]]:
    """Best-effort fund via XRPL Testnet Faucet. Never raises."""
    url = "https://faucet.altnet.rippletest.net/accounts"
    try:
        r = requests.post(url, json={"destination": destination}, timeout=20)
        try:
            data = r.json()
        except Exception:
            data = {"status_code": r.status_code, "text": r.text[:400]}
        ok = 200 <= r.status_code < 300 and isinstance(data, dict)
        return ok, data
    except Exception as e:
        return False, f"{type(e).__name__}: {e}"

def hugs_balance(address: str) -> float:
    """Read HUGS balance via trust lines."""
    try:
        res = client.request(AccountLines(account=address, ledger_index="validated")).result
        for line in res.get("lines", []):
            cur = line.get("currency")
            issuer_a = line.get("issuer")
            issuer_b = line.get("account")
            if cur == TOKEN and (issuer_a == ISSUER or issuer_b == ISSUER):
                return float(line.get("balance", "0"))
    except Exception:
        pass
    return 0.0

def has_hugs_trustline(address: str) -> bool:
    try:
        res = client.request(AccountLines(account=address, ledger_index="validated")).result
        for line in res.get("lines", []):
            cur = line.get("currency")
            issuer_a = line.get("issuer")
            issuer_b = line.get("account")
            if cur == TOKEN and (issuer_a == ISSUER or issuer_b == ISSUER):
                return True
    except Exception:
        pass
    return False

def create_trustline_testnet(address: str, seed: str) -> Dict[str, Any]:
    """
    Create a permissive trust line on testnet.
    Ensures activation first (auto-faucets if needed), then submits TrustSet.
    """
    if "altnet.rippletest.net" not in XRPL_RPC:
        return {"ok": False, "error": "not_testnet"}
    if not ISSUER:
        return {"ok": False, "error": "issuer_not_configured"}
    if not address or not seed:
        return {"ok": False, "error": "missing_params"}

    # 1) Ensure activation (fund if needed)
    if not is_account_activated(address):
        ok, info = faucet_fund_testnet(address)
        if not ok:
            return {"ok": False, "error": "faucet_failed", "detail": info}
        if not wait_for_activation(address, seconds=15):
            return {"ok": False, "error": "not_activated", "detail": "activation_timeout"}

    # 2) Submit TrustSet
    try:
        wallet = Wallet(seed=seed, sequence=0)
        tx = TrustSet(
            account=wallet.classic_address,
            limit_amount=IssuedCurrencyAmount(currency=TOKEN, issuer=ISSUER, value="1000000"),
            # OR flags; optional, but fine for demo
            flags=TrustSetFlag.TF_SET_NO_RIPPLE | TrustSetFlag.TF_SET_AUTH,
        )
        resp = sign_and_submit(tx, wallet, client)
        return {"ok": True, "result": resp.result}
    except Exception as e:
        return {"ok": False, "error": "trustset_failed", "detail": str(e)}

# ── Error handlers ───────────────────────────────────────────────────────────
@app.errorhandler(404)
def _nf(_): return jsonify(ok=False, error="not_found"), 404

@app.errorhandler(405)
def _nm(_): return jsonify(ok=False, error="method_not_allowed"), 405

@app.errorhandler(500)
def _se(e): return jsonify(ok=False, error="server_error", detail=str(e)), 500

# ── Health ───────────────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify(
        ok=True,
        rpc=XRPL_RPC,
        issuer=ISSUER or "(not set)",
        token=TOKEN,
        reward=REWARD_PER_WIN,
        issuer_seed_present=bool(ISSUER_SEED),
    )

# ── Create wallet (robust) ───────────────────────────────────────────────────
@app.route("/api/create_wallet", methods=["POST"])
def create_wallet():
    """
    Always creates a local wallet so gameplay is not blocked.
    Then tries to faucet-fund; we surface the status but never 5xx.
    """
    try:
        new_wallet = Wallet.create()
        funded, faucet_info = faucet_fund_testnet(new_wallet.classic_address)
        if funded:
            wait_for_activation(new_wallet.classic_address, seconds=10)
        return jsonify(
            ok=True,
            address=new_wallet.classic_address,
            seed=new_wallet.seed,
            funded=funded,
            faucet_info=(None if funded else faucet_info),
        ), 200
    except Exception as e:
        return jsonify(ok=False, error="create_wallet_exception", detail=str(e)), 200

# ── Balance ──────────────────────────────────────────────────────────────────
@app.route("/api/get_balance", methods=["GET"])
def get_balance():
    addr = (request.args.get("account") or "").strip()
    if not addr:
        return jsonify(ok=False, error="missing_account"), 400
    return jsonify(ok=True, hugs=hugs_balance(addr))

# ── Game start / round ───────────────────────────────────────────────────────
@app.route("/api/start_game", methods=["POST"])
def start_game():
    body = request.get_json(silent=True) or {}
    address = (body.get("address") or "").strip()
    if not address:
        return jsonify(ok=False, error="missing_address"), 400
    return jsonify(ok=True, message="Game started", level=1, round=1, reward=REWARD_PER_WIN)

@app.route("/api/start_round", methods=["POST"])
def start_round():
    return start_game()

# ── Trustline API used by the frontend before reward ─────────────────────────
@app.route("/api/testnet_trustline", methods=["POST"])
def api_testnet_trustline():
    try:
        data = request.get_json(force=True)
        address = (data.get("address") or "").strip()
        seed    = (data.get("seed") or "").strip()
        if not address or not seed:
            return jsonify(ok=False, error="missing_params"), 400
        if has_hugs_trustline(address):
            return jsonify(ok=True, already=True)
        out = create_trustline_testnet(address, seed)
        return jsonify(out), (200 if out.get("ok") else 200)
    except Exception as e:
        return jsonify(ok=False, error="trustline_error", detail=str(e)), 200

# ── Reward payout (issuer wallet required) ───────────────────────────────────
@app.route("/api/reward", methods=["POST"])
def reward():
    """
    Sends {amount} TOKEN from ISSUER to player's address.
    Requires ISSUER + ISSUER_SEED and a player trustline.
    """
    try:
        if not ISSUER:
            return jsonify(ok=False, error="issuer_not_configured"), 200
        if not ISSUER_SEED:
            return jsonify(ok=False, error="missing_ISSUER_SEED"), 200

        data = request.get_json(force=True)
        dest = (data.get("address") or "").strip()
        amount = str(data.get("amount") or REWARD_PER_WIN)
        if not dest:
            return jsonify(ok=False, error="missing_address"), 200

        if not has_hugs_trustline(dest):
            # Try to create one *if* the caller passed seed (optional)
            seed = (data.get("seed") or "").strip()
            if seed:
                tl = create_trustline_testnet(dest, seed)
                if not tl.get("ok"):
                    return jsonify(ok=False, error="no_trustline", detail=tl), 200
            else:
                return jsonify(ok=False, error="no_trustline"), 200

        issuer_wallet = Wallet(seed=ISSUER_SEED, sequence=0)
        amt = IssuedCurrencyAmount(currency=TOKEN, issuer=ISSUER, value=amount)
        tx = Payment(account=issuer_wallet.classic_address, destination=dest, amount=amt)
        resp = sign_and_submit(tx, issuer_wallet, client)
        txh = (resp.result.get("tx_json") or {}).get("hash")
        return jsonify(ok=True, tx_hash=txh, paid=amount)
    except Exception as e:
        return jsonify(ok=False, error="reward_error", detail=str(e)), 200

# ── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("DEBUG: .env loaded")
    print(f"XRPL RPC: {XRPL_RPC}")
    print(f"Issuer : {ISSUER or '(not set)'}")
    print(f"Token  : {TOKEN}")
    print(f"Reward : {REWARD_PER_WIN}")
    print(f"Issuer seed present: {bool(ISSUER_SEED)}")
    app.run(host="0.0.0.0", port=5000, debug=True)
