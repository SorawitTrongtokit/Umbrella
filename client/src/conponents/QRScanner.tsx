import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (umbrellaId: number) => void;
  availableUmbrellas: number[];
}

export default function QRScanner({ isOpen, onClose, onResult, availableUmbrellas }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setIsScanning(true);
    } catch (error) {
      toast({
        title: "ไม่สามารถเปิดกล้องได้",
        description: "กรุณาตรวจสอบการอนุญาตใช้กล้อง",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const simulateQRScan = () => {
    // Simulate QR code scanning for demo purposes
    if (availableUmbrellas.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableUmbrellas.length);
      const umbrellaId = availableUmbrellas[randomIndex];
      onResult(umbrellaId);
      handleClose();
    } else {
      toast({
        title: "ไม่มีร่มว่าง",
        description: "ไม่มีร่มที่สามารถยืมได้ในขณะนี้",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            สแกน QR Code
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times text-xl"></i>
            </button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Camera Preview Area */}
          <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center overflow-hidden">
            {isScanning ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <div className="text-center">
                <i className="fas fa-camera text-4xl text-gray-400 mb-3"></i>
                <p className="text-gray-600">กล้องจะเปิดที่นี่</p>
                <p className="text-xs text-gray-500 mt-1">วางร่มให้อยู่ในกรอบ</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {!isScanning ? (
              <Button 
                onClick={startCamera}
                className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <i className="fas fa-camera mr-2"></i>
                เปิดกล้อง
              </Button>
            ) : (
              <Button 
                onClick={simulateQRScan}
                className="w-full bg-secondary hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <i className="fas fa-qrcode mr-2"></i>
                จำลองการสแกน QR (สำหรับทดสอบ)
              </Button>
            )}
            
            <Button 
              onClick={handleClose}
              variant="outline"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
