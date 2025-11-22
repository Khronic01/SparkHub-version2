
import React, { useState, useRef } from 'react';
import { Upload, X, File as FileIcon, Loader2, CheckCircle } from 'lucide-react';

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  initialUrl?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onUploadComplete, 
  label = "Click to upload or drag and drop",
  accept = "image/*,application/pdf",
  maxSizeMB = 5,
  initialUrl
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    setIsUploading(true);

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setPreviewUrl(data.url);
      onUploadComplete(data.url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!previewUrl ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="bg-slate-100 p-3 rounded-full text-slate-500">
              {isUploading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <Upload size={24} />
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">
                {isUploading ? 'Uploading...' : (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:underline focus:outline-none"
                  >
                    Upload a file
                  </button>
                )}
                {!isUploading && <span className="text-slate-500"> or drag and drop</span>}
              </p>
              <p className="text-xs text-slate-500">
                PNG, JPG, PDF up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
           {/* Simple preview logic based on URL extension or dummy assumption */}
           <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {/* In a real app, check mime type. Here we assume image if it looks like one or came from our mock. */}
              {previewUrl.match(/\.(jpeg|jpg|gif|png)$/i) || previewUrl.includes('picsum') ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                  <FileIcon className="text-slate-400" size={24} />
              )}
           </div>
           
           <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">File uploaded successfully</p>
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                  {previewUrl}
              </a>
           </div>

           <button 
              onClick={clearFile}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove file"
           >
              <X size={18} />
           </button>
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <X size={14} />
            {error}
        </div>
      )}
    </div>
  );
};
