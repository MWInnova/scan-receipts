
import React, { useRef, useState, useCallback, useEffect } from 'react';

interface CameraViewProps {
  onCapture: (base64: string) => void;
  onCancel: () => void;
}

/**
 * A full-screen camera interface for capturing receipt images.
 * Uses the browser's MediaDevices API.
 */
const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  /**
   * Requests access to the environment (back) camera and streams it to the video element.
   */
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsInitializing(false);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Please enable camera access to scan receipts.");
      onCancel();
    }
  }, [onCancel]);

  // Handle camera lifecycle
  useEffect(() => {
    startCamera();
    return () => {
      // Clean up the camera stream when component unmounts
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  /**
   * Captures the current frame from the video stream and draws it to a hidden canvas.
   * Converts the canvas content to a Base64 JPEG string for processing.
   */
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(base64);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Loading Spinner during camera initialization */}
        {isInitializing && (
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white mx-auto mb-4"></div>
            <p>Initializing Camera...</p>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${isInitializing ? 'hidden' : 'block'}`}
        />
        {/* Visual Scanning Guide Overlay for better user alignment */}
        <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none flex items-center justify-center">
          <div className="w-full h-2/3 border-2 border-white/50 rounded-lg relative">
             <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
             <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
          </div>
        </div>
      </div>

      {/* Camera Controls Footer */}
      <div className="h-40 bg-black flex items-center justify-around px-8 safe-area-bottom">
        <button 
          onClick={onCancel}
          className="text-white text-lg font-medium"
        >
          Cancel
        </button>
        {/* The Capture Shutter Button */}
        <button 
          onClick={capturePhoto}
          className="w-20 h-20 bg-white rounded-full border-4 border-gray-400 active:scale-95 transition-transform flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full border-2 border-black/10"></div>
        </button>
        <div className="w-16"></div> {/* Spacer for layout symmetry */}
      </div>
      {/* Hidden canvas used for frame capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
