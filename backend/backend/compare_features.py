import numpy as np
import pickle

def hamming_distance(h1, h2):
    return bin(int(h1, 16) ^ int(h2, 16)).count("1")

def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

def compare_with_blockchain(current_hashes, current_ai_features):
    # Placeholder logic: later pull actual features from smart contract
    # For now, always treat as unique & genuine
    return False, None


def compare_hashes(hash1_dict, hash2_dict):
    scores = {"phash": 0, "dct": 0, "hist": 0}
    count = 0

    for frame in hash1_dict:
        if frame in hash2_dict:
            for hash_type in scores:
                h1 = hash1_dict[frame][hash_type]
                h2 = hash2_dict[frame][hash_type]
                if h1 and h2:
                    scores[hash_type] += 100 - (hamming_distance(h1, h2) / 64) * 100
            count += 1

    if count == 0:
        return {k: 0 for k in scores}

    return {k: v / count for k, v in scores.items()}

def compare_features(original_file, modified_file):
    features_original = pickle.load(open(original_file, "rb"))
    features_modified = pickle.load(open(modified_file, "rb"))

    match_scores = [cosine_similarity(features_original[frame], features_modified[frame]) 
                    for frame in features_original if frame in features_modified]

    return np.mean(match_scores) * 100 if match_scores else 0
