import { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File, preview: string) => void;
  isProcessing: boolean;
  preview?: string | null;
}

export default function ImageUploader({ onImageSelect, isProcessing, preview: externalPreview }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalPreview !== undefined) {
      setPreview(externalPreview);
    }
  }, [externalPreview]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setPreview(previewUrl);
      onImageSelect(file, previewUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-white'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={isProcessing}
          />
          <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Upload Chest X-Ray Image
          </p>
          <p className="text-sm text-gray-500">
            Drag and drop or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Supports: JPG, PNG, DICOM
          </p>
        </div>
      ) : (
        <div className="relative bg-white rounded-xl shadow-lg p-4">
          <button
            onClick={clearImage}
            disabled={isProcessing}
            className="absolute top-6 right-6 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={preview}
            alt="X-ray preview"
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
