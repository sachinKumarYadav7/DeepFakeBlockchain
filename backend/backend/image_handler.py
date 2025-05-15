import os
import pickle
from PIL import Image
import imagehash
import numpy as np
from backend.store_features import load_features, save_features
from backend.database import get_stored_videos, insert_video
from numpy.linalg import norm

def compute_hashes(image_path):
    img = Image.open(image_path).convert("RGB")
    return {
        "phash": str(imagehash.phash(img)),
        "dct": str(imagehash.dhash(img)),
        "hist": str(imagehash.average_hash(img))
    }

def extract_features(image_path):
    img = Image.open(image_path).convert("RGB").resize((224, 224))
    img_array = np.array(img).astype(np.float32) / 255.0
    features = img_array.flatten()
    return features

def cosine_similarity(a, b):
    return np.dot(a, b) / (norm(a) * norm(b))

def hamming_distance(h1, h2):
    return bin(int(h1, 16) ^ int(h2, 16)).count("1")

def compare_hashes(new_hash, stored_hash):
    total = 0
    for htype in ["phash", "dct", "hist"]:
        total += 100 - (hamming_distance(new_hash[htype], stored_hash[htype]) / 64) * 100
    return total / 3

def process_image(image_path):
    filename = os.path.basename(image_path)
    new_hash = compute_hashes(image_path)
    new_feat = extract_features(image_path)
    features_file = f"static/features/{filename}.pkl"
    save_features(new_feat, features_file)

    stored_videos = get_stored_videos()
    if not stored_videos:
        insert_video(filename, new_hash, features_file)
        return "This is the first image."

    best_match = None
    best_score = 0

    for fname, stored_hash, stored_feat_path in stored_videos:
        hash_sim = compare_hashes(new_hash, stored_hash)
        stored_feat = load_features(stored_feat_path)
        ai_sim = cosine_similarity(new_feat, stored_feat) * 100
        avg = (hash_sim + ai_sim) / 2
        if avg > best_score:
            best_score = avg
            best_match = fname

    insert_video(filename, new_hash, features_file)

    if best_score >= 90:
        return f"🟡 Duplicate image detected — similar to {best_match} ({best_score:.2f}%)"
    else:
        return f"✅ This is a new image (Best match: {best_match} — {best_score:.2f}%)"
