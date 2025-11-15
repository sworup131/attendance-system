let video = null;
let canvas = null;
let canvasContext = null;
let stream = null;
let isScanning = false;
let lastScannedQR = null;

// Initialize elements on page load
document.addEventListener('DOMContentLoaded', () => {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    canvasContext = canvas.getContext('2d');
});

/**
 * Start the camera and begin scanning for QR codes
 */
async function startCamera() {
    try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        video.srcObject = stream;
        video.play();

        // Set canvas dimensions
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        };

        // Show/hide buttons
        document.getElementById('start-camera-btn').style.display = 'none';
        document.getElementById('stop-camera-btn').style.display = 'block';

        isScanning = true;

        // Start the scanning loop
        scanQRCode();
    } catch (err) {
        console.error('Error accessing camera:', err);
        showError('Camera access denied. Please enable camera permissions and try again.');
    }
}

/**
 * Stop the camera
 */
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    isScanning = false;
    video.srcObject = null;
    document.getElementById('start-camera-btn').style.display = 'block';
    document.getElementById('stop-camera-btn').style.display = 'none';
}

/**
 * Main scanning loop - continuously scan for QR codes
 */
function scanQRCode() {
    if (!isScanning) return;

    try {
        // Draw current video frame to canvas
        canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data from canvas
        const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);

        // Scan for QR code
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

        if (qrCode && qrCode.data) {
            // QR code detected and decoded
            const scannedData = qrCode.data;

            // Avoid scanning the same QR code multiple times in quick succession
            if (scannedData !== lastScannedQR) {
                lastScannedQR = scannedData;
                handleQRCodeScanned(scannedData);
            }
        }
    } catch (err) {
        console.error('Scanning error:', err);
    }

    // Continue scanning
    requestAnimationFrame(scanQRCode);
}

/**
 * Handle successfully scanned QR code
 */
async function handleQRCodeScanned(qrData) {
    // Stop scanning
    stopCamera();

    try {
        // Send QR data to server
        const response = await fetch('/mark-attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ qrData: qrData })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess(data.message || 'Attendance marked successfully!', data.timestamp);
        } else {
            showError(data.message || 'Failed to mark attendance. Please try again.');
        }
    } catch (err) {
        console.error('Error marking attendance:', err);
        showError('An error occurred. Please try again.');
    }
}

/**
 * Display success message
 */
function showSuccess(message, timestamp) {
    const resultCard = document.getElementById('result-card');
    const resultMessage = document.getElementById('result-message');
    const resultTime = document.getElementById('result-time');

    resultMessage.textContent = message;
    if (timestamp) {
        resultTime.textContent = `Time: ${new Date(timestamp).toLocaleTimeString()}`;
    }

    resultCard.style.display = 'flex';
}

/**
 * Display error message
 */
function showError(message) {
    const errorCard = document.getElementById('error-card');
    const errorMessage = document.getElementById('error-message');

    errorMessage.textContent = message;
    errorCard.style.display = 'flex';
}

/**
 * Reset scanner and hide result card
 */
function resetScanner() {
    document.getElementById('result-card').style.display = 'none';
    lastScannedQR = null;
    startCamera();
}

/**
 * Dismiss error and hide error card
 */
function dismissError() {
    document.getElementById('error-card').style.display = 'none';
    startCamera();
}

/**
 * Handle logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        stopCamera();
        window.location.href = '/login';
    }
}
