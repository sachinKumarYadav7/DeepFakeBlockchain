import os
import json
import uuid
import mimetypes
import requests
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
from shutil import copyfile

from backend import (
    extract_frames,
    phash_extraction,
    ai_feature_extraction,
    store_features,
    compare_features
)
from backend.database import initialize_db, insert_video, get_stored_videos

## initialize flask app
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "static/uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

initialize_db()

JSON_ipfsCid_PATH = "ipfsCid.json"


def is_video(file_path):
    mime, _ = mimetypes.guess_type(file_path)
    return mime and mime.startswith("video")

def is_image(file_path):
    mime, _ = mimetypes.guess_type(file_path)
    return mime and mime.startswith("image")

def fetch_ipfs_media(ipfs_cid):
    url = f"http://127.0.0.1:8080/ipfs/{ipfs_cid}"
    response = requests.get(url)

    if response.status_code != 200:
        raise Exception("Failed to fetch from IPFS")

    content_type = response.headers.get("Content-Type", "")
    file_bytes = response.content



    return file_bytes, content_type

UPLOAD_FOLDER = "static/uploads"
JSON_DUMP_PATH = "latest_upload.json"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

initialize_db()

# === IPFS fetcher ===
def fetch_ipfs_media(ipfs_cid):
    url = f"http://127.0.0.1:8080/ipfs/{ipfs_cid}"
    response = requests.get(url)

    if response.status_code != 200:
        raise Exception("Failed to fetch from IPFS")

    content_type = response.headers.get("Content-Type", "")
    file_bytes = response.content

    return file_bytes, content_type

# === Video Processing ===

def convert_float32_to_float(obj):
    if isinstance(obj, np.float32):
        return float(obj)
    elif isinstance(obj, dict):
        return {key: convert_float32_to_float(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_float32_to_float(item) for item in obj]
    return obj

def process_video(filepath, filename):
    frames_folder = f"static/frames/{filename.split('.')[0]}"
    os.makedirs(frames_folder, exist_ok=True)

    extract_frames.extract_frames(filepath, frames_folder)
    hash_values = phash_extraction.extract_video_hashes(frames_folder)
    ai_features = ai_feature_extraction.extract_video_features(frames_folder)

    features_file = f"static/features/{filename}.pkl"
    store_features.save_features(ai_features, features_file)

    phash_list = []
    dct_list = []
    hist_list = []
    for frame in sorted(hash_values.keys()):
        phash_list.append(hash_values[frame]["phash"])
        dct_list.append(hash_values[frame]["dct"])
        hist_list.append(hash_values[frame]["hist"])

    stored_videos = get_stored_videos()
    is_duplicate = 1  # Assume unique

    if not stored_videos:
        insert_video(filename, hash_values, features_file)
        best_match = None
    else:
        similarities = []
        for stored_filename, stored_hashes, stored_features in stored_videos:
            hash_match = compare_features.compare_hashes(hash_values, stored_hashes)
            ai_match = compare_features.compare_features(features_file, stored_features)
            similarities.append((stored_filename, hash_match, ai_match))

        best = max(similarities, key=lambda x: x[2])
        is_duplicate = 0 if best[2] >= 90 else 1
        best_match = {
            "matched_video": best[0],
            "phash_percent": best[1]["phash"],
            "dct_percent": best[1]["dct"],
            "hist_percent": best[1]["hist"],
            "ai_match_percent": best[2]
        }
        insert_video(filename, hash_values, features_file)

    # Dump summary (convert to serializable data)
    summary = {
        "filename": filename,
        "phash_list": phash_list,
        "dct_list": dct_list,
        "hist_list": hist_list,
        "ai_feature_path": features_file,
        "duplicate_flag": is_duplicate,
        "best_match": best_match
    }

    # Convert summary with potential float32 to a serializable format
    summary = convert_float32_to_float(summary)

    with open(JSON_DUMP_PATH, "w") as f:
        json.dump(summary, f, indent=4)

    return jsonify(summary)



# === Image Processing ===
def process_image(filepath, filename):
    frame_folder = f"static/frames/{filename.split('.')[0]}"
    os.makedirs(frame_folder, exist_ok=True)
    copyfile(filepath, os.path.join(frame_folder, "frame_0.jpg"))

    hash_values = phash_extraction.extract_video_hashes(frame_folder)
    ai_features = ai_feature_extraction.extract_video_features(frame_folder)

    features_file = f"static/features/{filename}.pkl"
    store_features.save_features(ai_features, features_file)

    phash_list = []
    dct_list = []
    hist_list = []
    for frame in sorted(hash_values.keys()):
        phash_list.append(hash_values[frame]["phash"])
        dct_list.append(hash_values[frame]["dct"])
        hist_list.append(hash_values[frame]["hist"])

    summary = {
        "filename": filename,
        "phash_list": phash_list,
        "dct_list": dct_list,
        "hist_list": hist_list,
        "ai_feature_path": features_file,
        "duplicate_flag": 1,
        "best_match": {
            "matched_video": None,
            "phash_percent": 0,
            "dct_percent": 0,
            "hist_percent": 0,
            "ai_match_percent": 0
        }
    }

    with open(JSON_DUMP_PATH, "w") as f:
        json.dump(summary, f, indent=4)

    return jsonify(summary)

@app.route('/upload', methods=['POST'])
def receive_ipfs_cid():
    data = request.get_json()
    ipfs_cid = data.get('ipfs_cid')

    if not ipfs_cid:
        return jsonify({"error": "No CID provided"}), 400

    print("Received CID:", ipfs_cid)

    # Fetch from IPFS
    try:
        file_bytes, content_type = fetch_ipfs_media(ipfs_cid)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    filename = f"{uuid.uuid4()}.{content_type.split('/')[1]}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    with open(filepath, "wb") as f:
        f.write(file_bytes)

    # Detect media type and process
    if is_video(filepath):
        summary = process_video(filepath, filename)
        media_type = "video"
        print("Video processing complete")
    elif is_image(filepath):
        summary = process_image(filepath, filename)
        media_type = "image"
        print("Image processing complete")
    else:
        return jsonify({"error": "Unsupported file type"}), 415

    # Build new entry
    new_entry = {"ipfscid": ipfs_cid, "mediatype": media_type}

    # Load existing data (ensure valid format)
    if os.path.exists(JSON_ipfsCid_PATH) and os.path.getsize(JSON_ipfsCid_PATH) > 0:
        with open(JSON_ipfsCid_PATH, "r") as f:
            existing_data = json.load(f)
    else:
        existing_data = {"cid": []}

    # Only append if the CID is not already present
    if not any(entry["ipfscid"] == ipfs_cid for entry in existing_data["cid"]):
        existing_data["cid"].insert(0, new_entry)

    # Save updated list
    with open(JSON_ipfsCid_PATH, "w") as f:
        json.dump(existing_data, f, indent=4)

    return jsonify({
        "message": "CID received and processed",
        "cid": ipfs_cid,
        "media_type": media_type
    })




if __name__ == "__main__":
    app.run(debug=True)