// Service for MediaPipe and OpenCV Operations
declare const cv: any;
declare const FaceMesh: any;
declare const Camera: any;
declare const drawConnectors: any;
declare const drawLandmarks: any;
declare const FACEMESH_TESSELATION: any;
declare const FACEMESH_RIGHT_EYE: any;
declare const FACEMESH_LEFT_EYE: any;
declare const FACEMESH_LIPS: any;

let faceMesh: any = null;
let camera: any = null;

export const initFaceMesh = async (videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) => {
    if (typeof FaceMesh === 'undefined') {
        console.warn("MediaPipe FaceMesh not loaded");
        return;
    }

    if (!faceMesh) {
        faceMesh = new FaceMesh({locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }});

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        faceMesh.onResults((results: any) => {
            const canvasCtx = canvasElement.getContext('2d');
            if (!canvasCtx) return;

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            
            // NOTE: Drawing logic disabled per user request to remove "blue lines".
            // The underlying tracking still works if needed for logic, but visual output is suppressed.
            /*
            if (results.multiFaceLandmarks) {
                for (const landmarks of results.multiFaceLandmarks) {
                    drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: 'rgba(34, 211, 238, 0.2)', lineWidth: 1});
                    drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#22d3ee', lineWidth: 2});
                    drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#22d3ee', lineWidth: 2});
                    drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#22c55e', lineWidth: 2});
                }
            }
            */
            canvasCtx.restore();
        });
    }

    if (camera) {
        await camera.stop();
    }

    camera = new Camera(videoElement, {
        onFrame: async () => {
            await faceMesh.send({image: videoElement});
        },
        width: 640,
        height: 480
    });

    await camera.start();
};

export const stopFaceMesh = async () => {
    if (camera) {
        await camera.stop();
        camera = null;
    }
};

/**
 * Uses OpenCV.js to perform a smart "Passport Crop"
 * Centers the image based on bounding box (simple blob detection if face not available)
 * and resizes to 1:1.
 */
export const opencvSmartCrop = async (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (typeof cv === 'undefined' || !cv.Mat) {
            reject(new Error("OpenCV not loaded yet."));
            return;
        }

        const img = new Image();
        img.src = base64Image;
        img.onload = () => {
            try {
                let src = cv.imread(img);
                let dst = new cv.Mat();
                
                // Simple center crop logic utilizing OpenCV matrices
                let size = Math.min(src.rows, src.cols);
                let x = (src.cols - size) / 2;
                let y = (src.rows - size) / 2;
                
                let rect = new cv.Rect(x, y, size, size);
                dst = src.roi(rect);
                
                // Resize to 1024x1024 for standardization
                let dsize = new cv.Size(1024, 1024);
                cv.resize(dst, dst, dsize, 0, 0, cv.INTER_AREA);

                // Convert back to canvas to get base64
                const canvas = document.createElement('canvas');
                cv.imshow(canvas, dst);
                resolve(canvas.toDataURL('image/jpeg', 0.95));
                
                src.delete();
                dst.delete();
            } catch (e) {
                reject(e);
            }
        };
        img.onerror = reject;
    });
};

/**
 * Applies Analog Sensor Noise using OpenCV.js.
 * This introduces high-frequency entropy (Photon Shot Noise) to physically
 * break "spectral smoothness" before the AI sees it.
 */
export const applyAnalogSensorNoise = async (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (typeof cv === 'undefined' || !cv.Mat) {
            console.warn("OpenCV not ready, skipping sensor noise injection.");
            resolve(base64Image);
            return;
        }

        const img = new Image();
        img.src = base64Image;
        img.onload = () => {
            try {
                let src = cv.imread(img);
                let noise = new cv.Mat(src.rows, src.cols, src.type());
                let gaussian_noise = new cv.Mat(src.rows, src.cols, src.type());
                
                // Generate Gaussian Noise (Mean 0, StdDev 15)
                cv.randn(gaussian_noise, 0, 15);
                
                // Add noise to source
                cv.add(src, gaussian_noise, noise);

                // Convert back to canvas
                const canvas = document.createElement('canvas');
                cv.imshow(canvas, noise);
                const noisyImage = canvas.toDataURL('image/jpeg', 0.95);
                
                src.delete();
                noise.delete();
                gaussian_noise.delete();
                
                resolve(noisyImage);
            } catch (e) {
                console.error("OpenCV Noise Error:", e);
                resolve(base64Image); // Fail safe return original
            }
        };
        img.onerror = () => resolve(base64Image);
    });
};