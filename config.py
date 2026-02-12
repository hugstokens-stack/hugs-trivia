from dotenv import load_dotenv
import os

load_dotenv()

X_API_KEY = os.getenv("X_API_KEY")
X_API_SECRET = os.getenv("X_API_SECRET")
XRPL_WALLET = os.getenv("XRPL_WALLET")
XRPL_SECRET = os.getenv("XRPL_SECRET")
