import cv2
import os
import pickle
import face_recognition

encodings_path = "trainer/encodings.pickle"

if not os.path.exists(encodings_path):
    print(f"Model file '{encodings_path}' not found. Please run train_model.py first.")
    exit()

# Load reference images and encode them
print("Loading face encodings...")
with open(encodings_path, "rb") as f:
    data = pickle.load(f)

known_face_encodings = data["encodings"]
known_face_names = data["names"]

print(f"Loaded {len(known_face_encodings)} face encodings.")

# Open webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Cannot open camera")
    exit()

print("\nFace recognition started.")
print("Press Q to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Camera failed")
        break

    # Mirror/flip frame
    frame = cv2.flip(frame, 1)

    # Resize frame to 1/4 size for faster face recognition processing
    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)

    # Convert the image from BGR color (OpenCV default) to RGB color (face_recognition expects)
    rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

    # Find all the faces and face encodings in the current frame of video
    # Using 'hog' model which is fast and accurate on CPU
    face_locations = face_recognition.face_locations(rgb_small_frame, model="hog")
    face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        # See if the face is a match for the known face(s)
        # Tolerance: lower is more strict (default 0.6). 0.5 is a good balance for accuracy.
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5)
        name = "UNKNOWN"
        accuracy = 0

        # Calculate face distance to find the best match
        face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
        
        if len(face_distances) > 0:
            best_match_idx = face_distances.argmin()
            if matches[best_match_idx]:
                name = known_face_names[best_match_idx]
                distance = face_distances[best_match_idx]
                # Convert distance to a percentage-based accuracy score
                # 0.0 distance = 100% accuracy, 0.5 distance = 50% accuracy, etc.
                accuracy = int(max(0, (1.0 - distance) * 100))

        # Scale back up face locations since the frame we detected in was scaled to 1/4 size
        top *= 4
        right *= 4
        bottom *= 4
        left *= 4

        # Draw a box around the face
        color = (0, 255, 0) if name != "UNKNOWN" else (0, 0, 255)
        cv2.rectangle(frame, (left, top), (right, bottom), color, 2)

        # Draw a label with a name below the face
        label = f"{name} ({accuracy}%)" if name != "UNKNOWN" else name
        cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
        cv2.putText(
            frame, 
            label, 
            (left + 6, bottom - 6), 
            cv2.FONT_HERSHEY_SIMPLEX, 
            0.6, 
            (255, 255, 255), 
            1, 
            cv2.LINE_AA
        )

    # Display the resulting image
    cv2.imshow('Face Recognition', frame)

    # Hit 'q' on the keyboard to quit!
    key = cv2.waitKey(1)
    if key != -1:
        key = key & 0xFF
        if key == ord('q') or key == ord('Q'):
            break

cap.release()
cv2.destroyAllWindows()
