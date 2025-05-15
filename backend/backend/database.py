import sqlite3
import json

DB_PATH = "video_similarity.db"

def initialize_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            hash_json TEXT,
            features_path TEXT
        )
    """)
    conn.commit()
    conn.close()

def insert_video(filename, hash_data, features_path):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO videos (filename, hash_json, features_path) VALUES (?, ?, ?)",
        (filename, json.dumps(hash_data), features_path)
    )
    conn.commit()
    conn.close()

def get_stored_videos():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT filename, hash_json, features_path FROM videos")
    videos = cursor.fetchall()
    conn.close()
    return [(filename, json.loads(hash_json), features_path) for filename, hash_json, features_path in videos]
