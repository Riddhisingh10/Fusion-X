import cv2
import os
import pickle
import face_recognition

dataset_path = "dataset"
known_encodings = []
known_names = []

if not os.path.exists(dataset_path):
    print(f"Dataset path '{dataset_path}' does not exist. Please run capture_faces.py first.")
    exit()

print("Scanning dataset and encoding faces...")

# Iterate through each person
for person_name in os.listdir(dataset_path):
    person_path = os.path.join(dataset_path, person_name)
    if not os.path.isdir(person_path):
        continue

    print(f"\nProcessing images for '{person_name}':")
    
    # Traverse each angle folder (front, left, right, slightly_left, slightly_right)
    for folder_name in os.listdir(person_path):
        folder_path = os.path.join(person_path, folder_name)
        if not os.path.isdir(folder_path):
            continue
            
        # List all images in this folder
        images = [f for f in os.listdir(folder_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        if len(images) == 0:
            continue
            
        # Sample a subset to keep training fast but highly accurate.
        # We take up to 50 images per folder to ensure clean, high-quality encodings.
        sample_size = min(50, len(images))
        step = max(1, len(images) // sample_size)
        sampled_images = images[::step][:sample_size]
        
        print(f"  Encoding {len(sampled_images)} images from '{folder_name}' folder...")
        for img_name in sampled_images:
            img_path = os.path.join(folder_path, img_name)
            
            try:
                # Load image (face_recognition expects RGB)
                image = face_recognition.load_image_file(img_path)
                h_img, w_img = image.shape[:2]
                
                # Since dataset images are already cropped faces, we tell dlib that the face
                # is the entire image (0, width, height, 0). This bypasses the HOG detector,
                # resolving "No face detected" warnings and making encoding much faster.
                encodings = face_recognition.face_encodings(image, known_face_locations=[(0, w_img, h_img, 0)])
                
                if len(encodings) > 0:
                    known_encodings.append(encodings[0])
                    known_names.append(person_name)
                else:
                    print(f"    [Warning] Encoding failed for: {img_name}")
            except Exception as e:
                print(f"    [Error] Could not process {img_name}: {str(e)}")

# Save the encodings and names using pickle
os.makedirs("trainer", exist_ok=True)
with open("trainer/encodings.pickle", "wb") as f:
    pickle.dump({"encodings": known_encodings, "names": known_names}, f)

print(f"\nTraining completed! Successfully encoded {len(known_encodings)} face frames.")
print("Saved model to 'trainer/encodings.pickle'")