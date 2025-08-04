import React, { useRef } from "react";
import Webcam from "react-webcam";

const WebcamModal = ({ isOpen, onClose, onCapture, mode }) => {
  const webcamRef = useRef(null);

  const capturePhoto = () => {
    const screenshot = webcamRef.current.getScreenshot();
    if (screenshot) {
      onCapture(screenshot);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-md w-full text-center space-y-4">
        {mode === "clockout"
          ? "Click Photo to Clock Out"
          : "Click Photo to Clock In"}
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="rounded-md w-full"
        />
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={capturePhoto}
            className="px-4 py-2 bg-black text-white rounded"
          >
            {mode === "clockout" ? "Capture & Clock Out" : "Capture & Clock In"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebcamModal;
