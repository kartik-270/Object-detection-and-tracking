# 🕵️ Object Detection and Tracking using YOLOv8  

This project is a **real-time Object Detection and Tracking system** built with **YOLOv8 (by Ultralytics)** for the backend and a simple **HTML + JavaScript frontend** for user interaction. The system detects and tracks multiple objects from video streams, images, or webcam feeds with high accuracy and speed.  

---

## 📌 Features
- 🎯 Real-time object detection using **YOLOv8**  
- 📷 Supports both **webcam feed** and **uploaded videos/images**  
- 📊 Tracks multiple objects simultaneously with bounding boxes & labels  
- 🌐 Interactive frontend with **HTML, CSS, and JavaScript**  
- ⚡ Fast inference powered by Python (Flask backend)  

---

## 📂 Project Structure

├── index.html        # Frontend UI (main page)
├── app.js            # Frontend logic (handling video stream & requests)
├── app.py            # Backend server (Flask + YOLOv8 integration)
├── static/           # Static assets (CSS, JS, images)
├── uploads/          # Folder for uploaded images/videos
├── runs/             # YOLOv8 output (detections, labels, tracking results)
└── README.md         # Project documentation



---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
git clone https://github.com/your-username/object-detection-tracking.git
cd object-detection-tracking


### 2️⃣ Install Dependencies

Make sure you have **Python 3.8+** installed. Then run:

pip install -r requirements.txt


### 3️⃣ Install YOLOv8

Install the official **Ultralytics YOLOv8** package:

pip install ultralytics


Verify installation:


yolo predict model=yolov8n.pt source='https://ultralytics.com/images/bus.jpg'


### 4️⃣ Run the Backend Server


python app.py

This will start the Flask backend (default: `http://127.0.0.1:5000`).

### 5️⃣ Open the Frontend

Open `index.html` in your browser, or visit:

http://127.0.0.1:5000


---

## 🛠️ Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Python (Flask)
* **Model:** YOLOv8 (Ultralytics)
* **Libraries:** OpenCV, NumPy, Ultralytics YOLO

---

## 🎯 Future Improvements

* ✅ Integration with **YOLOv8 tracking** (ByteTrack/DeepSORT)
* ✅ Deploy as a cloud-based API (FastAPI + Docker)
* ✅ Add analytics dashboard for object counts & tracking paths
* ✅ Support for live streaming over RTSP



## 🤝 Contributing

Contributions are welcome! Please fork the repo and create a pull request.



## 📜 License

This project is licensed under the **MIT License**.

