import React, { useState, useRef } from 'react';
import { X, Loader2, Video } from 'lucide-react';
import { api } from '../../services/api';

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  uploadPath: string;
  className?: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  value,
  onChange,
  label = 'Video',
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
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    // Validate file size (50MB max for videos)
    if (file.size > 50 * 1024 * 1024) {
      alert('Video must be less than 50MB');
      return;
    }

    setUploading(true);

    try {
      const url = await api.uploadVideo(file, uploadPath);
      setPreview(url);
      onChange(url);
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (preview) {
      api.deleteVideo(preview).catch(console.error);
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
            <video
              src={preview}
              controls
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
                <Video size={32} className="text-foreground/30 mb-2" />
                <p className="text-xs text-foreground/40 font-satoshi text-center">
                  Click to upload video
                </p>
                <p className="text-[10px] text-foreground/30 font-satoshi mt-1">
                  MP4, WebM up to 50MB
                </p>
              </>
            )}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>
    </div>
  );
};

export default VideoUpload;
