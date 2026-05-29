import cv2
import os
import time

# =========================
# USER NAME
# =========================

name = input("Enter member name: ")

# =========================
# CREATE FOLDERS
# =========================

base_path = f"dataset/{name}"

front_path = f"{base_path}/front"
slightly_left_path = f"{base_path}/slightly_left"
left_path = f"{base_path}/left"
slightly_right_path = f"{base_path}/slightly_right"
right_path = f"{base_path}/right"

os.makedirs(front_path, exist_ok=True)
os.makedirs(slightly_left_path, exist_ok=True)
os.makedirs(left_path, exist_ok=True)
os.makedirs(slightly_right_path, exist_ok=True)
os.makedirs(right_path, exist_ok=True)

# =========================
# CAMERA
# =========================

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Cannot open camera")
    exit()

# =========================
# FACE DETECTORS
# =========================

frontal_detector = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)
profile_detector = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_profileface.xml"
)

def get_iou(boxA, boxB):
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[0] + boxA[2], boxB[0] + boxB[2])
    yB = min(boxA[1] + boxA[3], boxB[1] + boxB[3])
    
    interArea = max(0, xB - xA) * max(0, yB - yA)
    if interArea == 0:
        return 0.0
        
    boxAArea = boxA[2] * boxA[3]
    boxBArea = boxB[2] * boxB[3]
    
    return interArea / float(min(boxAArea, boxBArea))

def equalize_color(img):
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    channels = list(cv2.split(ycrcb))
    channels[0] = cv2.equalizeHist(channels[0])
    ycrcb = cv2.merge(channels)
    return cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2BGR)

def detect_faces_with_pose(gray_img):
    faces_with_pose = [] # List of (x, y, w, h, pose)
    
    # 1. Frontal faces
    front_faces = frontal_detector.detectMultiScale(
        gray_img, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80)
    )
    for f in front_faces:
        faces_with_pose.append((int(f[0]), int(f[1]), int(f[2]), int(f[3]), "FRONT"))
        
    # 2. Profile faces (right side profile)
    profile_r = profile_detector.detectMultiScale(
        gray_img, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80)
    )
    for f in profile_r:
        faces_with_pose.append((int(f[0]), int(f[1]), int(f[2]), int(f[3]), "RIGHT"))
        
    # 3. Profile faces (left side profile by flipping image horizontally)
    flipped_gray = cv2.flip(gray_img, 1)
    profile_l = profile_detector.detectMultiScale(
        flipped_gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80)
    )
    w_img = gray_img.shape[1]
    for (x, y, w, h) in profile_l:
        faces_with_pose.append((int(w_img - x - w), int(y), int(w), int(h), "LEFT"))
        
    # Filter out significant overlaps to ensure clean unique face boxes
    unique_faces = []
    if len(faces_with_pose) > 0:
        sorted_faces = sorted(faces_with_pose, key=lambda x: x[2] * x[3], reverse=True)
        for face_info in sorted_faces:
            box = face_info[:4]
            is_duplicate = False
            for u_face in unique_faces:
                u_box = u_face[:4]
                if get_iou(box, u_box) > 0.4:
                    is_duplicate = True
                    break
            if not is_duplicate:
                unique_faces.append(face_info)
                
    return unique_faces

# =========================
# STAGES & THROTTLING
# =========================

stages = [
    {"name": "FRONT", "path": front_path, "display": "Look Straight (FRONT)"},
    {"name": "SLIGHTLY_LEFT", "path": slightly_left_path, "display": "Turn Head SLIGHTLY LEFT"},
    {"name": "LEFT", "path": left_path, "display": "Turn Head LEFT (Profile)"},
    {"name": "SLIGHTLY_RIGHT", "path": slightly_right_path, "display": "Turn Head SLIGHTLY RIGHT"},
    {"name": "RIGHT", "path": right_path, "display": "Turn Head RIGHT (Profile)"}
]

current_stage_idx = 0
stage_counts = [0, 0, 0, 0, 0]

state = "COUNTDOWN"  # COUNTDOWN or CAPTURING
countdown_duration = 3.0  # 3 seconds countdown
countdown_start = time.time()

last_capture_time = 0
capture_interval = 0.04  # 40ms interval (approx 25 frames/sec)

print("\nStarting automatic 5-stage face capture.")
print("Press Q to quit at any time.")

# =========================
# LOOP
# =========================

while True:
    ret, frame = cap.read()
    if not ret:
        print("Camera failed")
        break

    frame = cv2.flip(frame, 1)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    current_time = time.time()

    # Check if all stages are completed
    if current_stage_idx >= len(stages):
        print("\nAll stages captured successfully!")
        break

    current_stage = stages[current_stage_idx]
    stage_name = current_stage["name"]
    stage_display = current_stage["display"]
    stage_path = current_stage["path"]
    stage_count = stage_counts[current_stage_idx]

    # Detect faces and their poses
    faces_with_pose = detect_faces_with_pose(gray)
    main_face = faces_with_pose[0] if len(faces_with_pose) > 0 else None

    is_pose_valid = False
    pose_text = "NONE"

    if main_face is not None:
        x, y, w, h, pose = main_face
        pose_text = pose

        # Validate if face matches current stage requirements
        if stage_name == "FRONT" and pose == "FRONT":
            is_pose_valid = True
        elif stage_name == "LEFT" and pose == "LEFT":
            is_pose_valid = True
        elif stage_name == "RIGHT" and pose == "RIGHT":
            is_pose_valid = True
        elif stage_name == "SLIGHTLY_LEFT" and pose in ["FRONT", "LEFT"]:
            is_pose_valid = True
        elif stage_name == "SLIGHTLY_RIGHT" and pose in ["FRONT", "RIGHT"]:
            is_pose_valid = True

    # Draw detected face box(es)
    for face_info in faces_with_pose:
        fx, fy, fw, fh, fpose = face_info
        is_main = (main_face is not None and fx == main_face[0] and fy == main_face[1])
        
        if is_main:
            if state == "COUNTDOWN":
                color = (0, 255, 255)  # Yellow
                label = f"Ready: {fpose}"
            elif is_pose_valid:
                color = (0, 255, 0)  # Green
                label = f"Capturing: {fpose}"
            else:
                color = (0, 165, 255)  # Orange
                label = f"Invalid Pose for {stage_name}: {fpose}"
        else:
            color = (128, 128, 128)  # Gray
            label = "Background"

        cv2.rectangle(frame, (fx, fy), (fx + fw, fy + fh), color, 2)
        cv2.putText(frame, label, (fx, fy - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    # Capture Logic
    if state == "COUNTDOWN":
        elapsed = current_time - countdown_start
        time_left = max(0.0, countdown_duration - elapsed)
        if time_left <= 0:
            state = "CAPTURING"
        else:
            # Draw on-screen banner for countdown
            h_img, w_img = frame.shape[:2]
            cv2.rectangle(frame, (10, h_img - 110), (w_img - 10, h_img - 10), (0, 0, 0), -1)
            cv2.putText(frame, f"GET READY FOR: {stage_display}", (20, h_img - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            cv2.putText(frame, f"Starting in {int(time_left) + 1}...", (20, h_img - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    
    elif state == "CAPTURING":
        if is_pose_valid and (current_time - last_capture_time >= capture_interval):
            # Safe cropping boundaries
            img_h, img_w = frame.shape[:2]
            x, y, w, h, _ = main_face
            x1, y1 = max(0, x), max(0, y)
            x2, y2 = min(img_w, x + w), min(img_h, y + h)

            face_color = frame[y1:y2, x1:x2]
            face_gray = gray[y1:y2, x1:x2]

            if face_color.size > 0 and face_gray.size > 0:
                face_color = cv2.resize(face_color, (200, 200))
                face_gray = cv2.resize(face_gray, (200, 200))

                # Save color (1-350) or grayscale (351-700)
                stage_counts[current_stage_idx] += 1
                count_val = stage_counts[current_stage_idx]

                if count_val <= 350:
                    eq_color = equalize_color(face_color)
                    cv2.imwrite(f"{stage_path}/{count_val}.jpg", eq_color)
                else:
                    eq_gray = cv2.equalizeHist(face_gray)
                    cv2.imwrite(f"{stage_path}/{count_val}.jpg", eq_gray)

                last_capture_time = current_time

                # Check if current stage is completed
                if count_val >= 700:
                    print(f"Completed stage: {stage_name}")
                    current_stage_idx += 1
                    if current_stage_idx < len(stages):
                        state = "COUNTDOWN"
                        countdown_start = time.time()

        # If pose is invalid, show a correction message
        if not is_pose_valid and main_face is not None:
            h_img, w_img = frame.shape[:2]
            cv2.rectangle(frame, (10, h_img - 70), (w_img - 10, h_img - 10), (0, 0, 255), -1)
            cv2.putText(frame, f"ADJUST POSE: Please {stage_display}", (20, h_img - 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    # =========================
    # STATS OVERLAY
    # =========================

    for i, stg in enumerate(stages):
        stg_name = stg["name"]
        stg_count = stage_counts[i]
        if i == current_stage_idx:
            if state == "CAPTURING":
                color = (0, 255, 0) if is_pose_valid else (0, 165, 255)
                text = f"-> {stg_name}: {stg_count}/700"
            else:
                color = (0, 255, 255)
                text = f"-> {stg_name}: {stg_count}/700 (READYING)"
        else:
            color = (200, 200, 200)
            text = f"   {stg_name}: {stg_count}/700"
        cv2.putText(frame, text, (20, 40 + i * 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    cv2.imshow("Face Capture", frame)

    # =========================
    # KEYS
    # =========================

    key = cv2.waitKey(1)
    if key != -1:
        key = key & 0xFF
        if key == ord('q') or key == ord('Q'):
            print("\nProcess interrupted by user.")
            break

cap.release()
cv2.destroyAllWindows()