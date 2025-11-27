import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrCode, Camera, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QRScannerComponentProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const QRScannerComponent: React.FC<QRScannerComponentProps> = ({
  trigger,
  open,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  const modalOpen = open ?? isOpen;
  const setModalOpen = onOpenChange ?? setIsOpen;

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader-modal");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setScannedResult(decodedText);
          stopScanner();

          // Agar URL bo'lsa, evidence ID ni ajratib olish
          const match = decodedText.match(/\/evidence\/(\d+)/);
          if (match) {
            setModalOpen(false);
            navigate(`/evidence/${match[1]}/view`);
          }
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Scanner xatosi:", err);
      alert("Kamerani ochishda xatolik. Iltimos, kamera ruxsatini tekshiring.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Scanner to'xtatishda xato:", err);
      }
    }
    setIsScanning(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      stopScanner();
      setScannedResult(null);
    }
    setModalOpen(newOpen);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <QrCode className="h-6 w-6 mr-2 text-blue-600" />
            QR Kod Scanner
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div
            id="qr-reader-modal"
            className="w-full rounded-lg overflow-hidden bg-gray-100"
            style={{ minHeight: isScanning ? "300px" : "0" }}
          />

          {!isScanning ? (
            <Button
              onClick={startScanner}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="h-5 w-5 mr-2" />
              Kamerani ochish
            </Button>
          ) : (
            <Button
              onClick={stopScanner}
              variant="destructive"
              className="w-full"
            >
              <X className="h-5 w-5 mr-2" />
              Skanerni to'xtatish
            </Button>
          )}

          {scannedResult && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800">Natija:</p>
              <p className="text-green-700 break-all">{scannedResult}</p>
            </div>
          )}

          <p className="text-sm text-gray-500 text-center">
            Ashyoviy dalilning QR kodini kameraga ko'rsating
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

