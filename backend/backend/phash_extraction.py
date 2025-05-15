from PIL import Image
import imagehash
import os
import json

def compute_hashes(image_path):
    img = Image.open(image_path).convert("L")  # Grayscale for pHash and DCT
    color_img = Image.open(image_path).convert("RGB")  # Color for histogram

    return {
        "phash": str(imagehash.phash(img)),
        "dct": str(imagehash.dhash(img)),
        "hist": str(imagehash.average_hash(color_img))
    }

def extract_video_hashes(frames_folder):
    hash_dict = {}
    for img_name in sorted(os.listdir(frames_folder)):
        img_path = os.path.join(frames_folder, img_name)
        hash_dict[img_name] = compute_hashes(img_path)
    return hash_dict
