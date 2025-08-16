document.addEventListener('DOMContentLoaded', () => {
    const videoRef = document.getElementById('videoElement');
    const canvasRef = document.getElementById('canvasElement');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const messageBox = document.getElementById('messageBox');
    const messageContent = document.getElementById('messageContent');

    let isStreaming = false;
    let currentStream = null;
    let animationFrameId;
    let lastDetectionTime = 0;
    const detectionInterval = 100; 
    let detectedObjects = []; 

    const showMessageBox = (msg) => {
        messageContent.textContent = msg;
        messageBox.classList.remove('hidden');
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 3000); 
    };

    const startStream = async () => {
        console.log("Attempting to start stream...");
        if (isStreaming) {
            console.log("Stream already active, returning.");
            return;
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef) {
                videoRef.srcObject = mediaStream;
                await videoRef.play();
                isStreaming = true;
                currentStream = mediaStream;
                startButton.disabled = true;
                stopButton.disabled = false;
                console.log("Stream started successfully.");
                drawLoop(); 
            }
        } catch (err) {
            console.error("Error accessing webcam: ", err);
            showMessageBox(`Error accessing webcam: ${err.name} - ${err.message}. Please ensure you have a webcam and grant permission.`);
        }
    };

    const stopStream = () => {
        console.log("Attempting to stop stream...");
        if (currentStream) {
            currentStream.getTracks().forEach(track => {
                console.log(`Stopping track: ${track.kind}`);
                track.stop();
            });
            currentStream = null;
            videoRef.srcObject = null; 
            console.log("Stream tracks stopped.");
        }
        isStreaming = false;
        startButton.disabled = false;
        stopButton.disabled = true;
        detectedObjects = []; 

        if (canvasRef) {
            const ctx = canvasRef.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
            console.log("Canvas cleared.");
        }
        cancelAnimationFrame(animationFrameId);
        console.log("Animation loop stopped.");
    };

    const drawDetectedObjects = (ctx, video, objects) => {
        ctx.lineWidth = 2;
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';

        objects.forEach(obj => {
            const [x1, y1, x2, y2] = obj.box;
            const width = x2 - x1;
            const height = y2 - y1;

            ctx.strokeStyle = '#00FF00'; // Green
            ctx.strokeRect(x1, y1, width, height);

            ctx.fillStyle = '#00FF00';
            const text = `${obj.label} (${(obj.confidence * 100).toFixed(1)}%)`;
            const textX = x1 + 5;
            const textY = y1 + 20;

            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            const textHeight = 20; 
            ctx.fillRect(textX - 2, textY - textHeight + 4, textWidth + 4, textHeight + 4);

            ctx.fillStyle = '#000000'; // Black text
            ctx.fillText(text, textX, textY);
        });
    };

    const sendFrameForDetection = async () => {
        if (!isStreaming || videoRef.paused || videoRef.ended || videoRef.videoWidth === 0 || videoRef.videoHeight === 0) {
            console.log("Skipping frame send: not streaming, video paused/ended, or dimensions zero.");
            return;
        }

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = videoRef.videoWidth;
        tempCanvas.height = videoRef.videoHeight;

        tempCtx.drawImage(videoRef, 0, 0, tempCanvas.width, tempCanvas.height);

        const imageDataUrl = tempCanvas.toDataURL('image/jpeg', 0.7); // 0.7 quality
        const base64Image = imageDataUrl.split(',')[1]; 

        try {
            const response = await fetch('/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            detectedObjects = data.detections || [];

        } catch (error) {
            console.error("Error sending frame for detection:", error);
            
        }
    };

    const drawLoop = () => {
        if (videoRef && canvasRef && isStreaming && !videoRef.paused && !videoRef.ended) {
            const ctx = canvasRef.getContext('2d');

            if (videoRef.videoWidth > 0 && videoRef.videoHeight > 0) {
                canvasRef.width = videoRef.videoWidth;
                canvasRef.height = videoRef.videoHeight;
                ctx.drawImage(videoRef, 0, 0, canvasRef.width, canvasRef.height);

                drawDetectedObjects(ctx, videoRef, detectedObjects);

                const currentTime = Date.now();
                if (currentTime - lastDetectionTime > detectionInterval) {
                    sendFrameForDetection();
                    lastDetectionTime = currentTime;
                }
            } else {
                console.log("Video dimensions not ready yet.");
            }
        }
        animationFrameId = requestAnimationFrame(drawLoop); 
    };

    startButton.addEventListener('click', startStream);
    stopButton.addEventListener('click', stopStream);

    startButton.disabled = false;
    stopButton.disabled = true;

    window.addEventListener('beforeunload', stopStream);
});
