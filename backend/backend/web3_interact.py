from web3 import Web3
import json

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
contract_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

with open("artifacts/contracts/VideoVerification.sol/VideoVerification.json") as f:
    abi = json.load(f)["abi"]

contract = w3.eth.contract(address=contract_address, abi=abi)
default_account = w3.eth.accounts[0]
w3.eth.default_account = default_account

def upload_genuine_video(video_id, hashes, ai_features):
    tx = contract.functions.uploadGenuineVideo(
        video_id,
        hashes["phash"],
        hashes["dct"],
        hashes["hist"],
        str(ai_features[:16].tolist())  # Only sample feature
    ).transact()
    w3.eth.wait_for_transaction_receipt(tx)

def log_deepfake_attempt(video_id, hashes, ai_features):
    tx = contract.functions.logDeepfakeAttempt(
        video_id,
        hashes["phash"],
        hashes["dct"],
        hashes["hist"],
        str(ai_features[:16].tolist())
    ).transact()
    w3.eth.wait_for_transaction_receipt(tx)

def request_permission(video_id):
    tx = contract.functions.requestPermission(video_id).transact()
    w3.eth.wait_for_transaction_receipt(tx)

def grant_permission(original_video_id, user, new_video_id):
    tx = contract.functions.grantPermission(original_video_id, user, new_video_id).transact()
    w3.eth.wait_for_transaction_receipt(tx)
