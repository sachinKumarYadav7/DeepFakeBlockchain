import pickle

def save_features(data, path):
    with open(path, "wb") as f:
        pickle.dump(data, f)

def load_features(path):
    with open(path, "rb") as f:
        return pickle.load(f)
