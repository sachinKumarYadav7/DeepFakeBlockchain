import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import os

model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

def extract_features(image_path):
    img = Image.open(image_path).convert("RGB")
    img_tensor = transform(img).unsqueeze(0)
    with torch.no_grad():
        features = model(img_tensor)
    return features.squeeze().numpy()

def extract_video_features(frame_dir):
    features_dict = {}
    for img_name in sorted(os.listdir(frame_dir)):
        img_path = os.path.join(frame_dir, img_name)
        features_dict[img_name] = extract_features(img_path)
    return features_dict
