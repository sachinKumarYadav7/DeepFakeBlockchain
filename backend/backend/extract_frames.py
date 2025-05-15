import cv2
import os

def extract_frames(video_path, output_folder, fps=5):
    """Extract frames from video at the given FPS and save them in the output folder."""
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    video_fps = int(cap.get(cv2.CAP_PROP_FPS))

    print(f"🔹 Total frames in video: {total_frames}, Video FPS: {video_fps}")

    frame_count = 0
    success, image = cap.read()
    while success:
        if frame_count % (video_fps // fps) == 0:  # Extract frames at the specified rate
            frame_name = f"{output_folder}/frame_{frame_count:04d}.jpg"
            cv2.imwrite(frame_name, image)
        
        success, image = cap.read()
        frame_count += 1

    cap.release()
    print(f"✅ Extracted {frame_count} frames in '{output_folder}'.")

# Example usage:
# extract_frames("videos/original.mp4", "frames_original/", fps=10)  # Adjust fps as needed
