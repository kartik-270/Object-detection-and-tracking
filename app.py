from flask import Flask, render_template, send_from_directory, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
from ultralytics import YOLO # Import YOLO model from ultralytics
import torch

app = Flask(__name__, static_folder='static') 
CORS(app) 

try:
    model = YOLO("yolov8n.pt")
    print("YOLOv8n model loaded successfully.")
except Exception as e:
    print(f"Error loading YOLOv8 model: {e}")
    model = None 

def run_object_detection_model(image_data_b64):

    if model is None:
        print("Model not loaded. Cannot perform detection.")
        return []

    try:
        img_bytes = base64.b64decode(image_data_b64)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            print("Failed to decode image data.")
            return []

        results = model(img, verbose=False)

        detections = []
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0]) 
                confidence = float(box.conf[0])      
                class_id = int(box.cls[0])           
                label = model.names[class_id]       

                detections.append({
                    "label": label,
                    "confidence": round(confidence, 2),
                    "box": [x1, y1, x2, y2] # [x_min, y_min, x_max, y_max]
                })
        print(f"Detected {len(detections)} objects.")
        return detections

    except Exception as e:
        print(f"Error during object detection: {e}")
        return []


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

@app.route('/detect', methods=['POST'])
def detect_objects():
   if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
   data = request.get_json()
   image_data_b64 = data.get('image')
   if not image_data_b64:
        return jsonify({"error": "No image data (base64) provided"}), 400

   detections = run_object_detection_model(image_data_b64)

   return jsonify({"detections": detections})

if __name__ == '__main__':
    app.run(debug=True)
