import os
import xrpl

from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import Payment
from xrpl.transaction import safe_sign_and_submit_transaction
from xrpl.models.amounts import IssuedCurrencyAmount

def send_hugs(destination_tag=None, destination_address=None):
    network = os.getenv("XRPL_NETWORK")
    client = JsonRpcClient(network)
    wallet = Wallet(seed=os.getenv("XRPL_SECRET"), sequence=0)

    amount = os.getenv("HUGS_AMOUNT", "5")
    issuer = os.getenv("HUGS_ISSUER")
    currency = os.getenv("HUGS_CURRENCY", "HUGS")

    payment = Payment(
        account=wallet.classic_address,
        destination=destination_address,
        amount=IssuedCurrencyAmount(currency=currency, issuer=issuer, value=amount),
        destination_tag=destination_tag,
    )

    response = safe_sign_and_submit_transaction(payment, wallet, client)
    print("✅ XRPL payment response:", response)
    return response
