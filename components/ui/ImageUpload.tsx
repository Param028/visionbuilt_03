import React, { useState, useRef } from 'react';
import { X, Loader2, ImageIcon } from 'lucide-react';
import { api } from '../../services/api';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  uploadPath: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Image',
  uploadPath,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size(5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const url = await api.uploadImage(file, uploadPath);
      setPreview(url);
      onChange(url);
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (preview) {
      api.deleteImage(preview).catch(console.error);
    }
    setPreview(undefined);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-xs font-display font-semibold text-foreground uppercase tracking-wider">
          {label}
        </label>
      )}
      
      <div className="relative">
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-white/10"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-48 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all"
          >
            {uploading ? (
              <Loader2 size={32} className="text-foreground/50 animate-spin" />
            ) : (
              <>
                <ImageIcon size={32} className="text-foreground/30 mb-2" />
                <p className="text-xs text-foreground/40 font-satoshi text-center">
                  Click to upload image
                </p>
                <p className="text-[10px] text-foreground/30 font-satoshi mt-1">
                  PNG, JPG up to 5MB
                </p>
              </>
            )}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>
    </div>
  );
};

export default ImageUpload;
