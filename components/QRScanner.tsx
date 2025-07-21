'use client';

import { useState, useRef, useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function QRScanner({ onScan, onError, isOpen, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [codeReader] = useState(() => new BrowserQRCodeReader());
  const [isScanning, setIsScanning] = useState(false);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startScanning();
    }
    
    return () => {
      stopScanning();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const stopScanning = () => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }
    setIsScanning(false);
  };

  const startScanning = async () => {
    if (!videoRef.current) return;
    
    try {
      setIsScanning(true);
      
      // 获取摄像头权限
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      setCurrentStream(stream);
      videoRef.current.srcObject = stream;
      
      // 开始扫描
      await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            setIsScanning(false);
            onScan(result.getText());
            stopScanning();
            onClose();
          }
          if (error && error.name !== 'NotFoundException') {
            console.error('QR Scanner Error:', error);
          }
        }
      );
      
    } catch (err) {
      console.error('Failed to start scanning:', err);
      setIsScanning(false);
      if (onError) {
        onError(err as Error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Scan Restaurant QR Code
          </h3>
          <button
            onClick={() => {
              stopScanning();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 bg-black rounded"
            autoPlay
            playsInline
            muted
          />
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Point your camera at the restaurant's payment QR code
          </p>
          {isScanning && (
            <p className="text-xs text-blue-500 mt-2">Scanning...</p>
          )}
        </div>
        
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => {
              stopScanning();
              onClose();
            }}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
