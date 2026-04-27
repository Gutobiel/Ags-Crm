import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';

interface CropModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
}

export default function CropModal({ imageSrc, onClose, onCropComplete }: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Ajustar Foto</h3>
        </div>
        
        <div className="relative h-80 w-full bg-gray-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
            style={{ containerStyle: { backgroundColor: '#f3f4f6' } }}
          />
        </div>
        
        <div className="p-4 flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 block mb-2">Zoom</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isProcessing ? 'Salvando...' : 'Salvar Foto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
