import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, AlertCircle } from 'lucide-react';
import { SourceImageData } from '../../providers/types';
import { validateImageFile, VALIDATION_LIMITS } from '../../utils/validators';
import { formatFileSize } from '../../utils/formatters';
import { Badge } from '../common/Badge';

interface ImageDropzoneProps {
  image: SourceImageData | null;
  onImageChange: (image: SourceImageData | null) => void;
  error?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  image,
  onImageChange,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setValidationError(null);
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      // Detect natural width and height
      const img = new Image();
      img.onload = () => {
        onImageChange({
          dataUrl,
          name: file.name,
          sizeBytes: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>Source Image</span>
          <span className="text-amber-400">*</span>
        </label>
        <span className="text-[11px] text-slate-500 font-mono">PNG, JPG, WebP (Max 10MB)</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={VALIDATION_LIMITS.ALLOWED_IMAGE_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {image ? (
        /* Image Preview State */
        <div className="relative rounded-2xl border border-amber-500/40 bg-studio-surface/90 overflow-hidden shadow-xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-48 h-36 rounded-xl overflow-hidden bg-black/60 border border-white/10 flex-shrink-0">
            <img
              src={image.dataUrl}
              alt={image.name}
              className="w-full h-full object-cover"
            />
            {image.width && image.height && (
              <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-[10px] font-mono px-1.5 py-0.5 rounded text-slate-300 border border-white/10">
                {image.width} × {image.height}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="emerald" size="sm">
                Ready for Animation
              </Badge>
              <Badge variant="outline" size="sm">
                {image.type.replace('image/', '').toUpperCase()}
              </Badge>
            </div>
            <h4 className="text-sm font-semibold text-slate-100 truncate">{image.name}</h4>
            <p className="text-xs text-slate-400 mt-1">
              File size: {formatFileSize(image.sizeBytes)}
            </p>

            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Replace Image</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone State */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer group select-none ${
            isDragOver
              ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
              : error || validationError
              ? 'border-rose-500/60 bg-rose-500/5'
              : 'border-studio-border hover:border-amber-500/50 bg-studio-surface/50 hover:bg-studio-surface/80'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/10">
            {isDragOver ? (
              <UploadCloud className="w-7 h-7 animate-bounce" />
            ) : (
              <ImageIcon className="w-7 h-7" />
            )}
          </div>

          <h4 className="text-sm font-semibold text-slate-200 text-center">
            Drop your keyframe image here, or{' '}
            <span className="text-amber-400 underline decoration-amber-500/40">browse files</span>
          </h4>
          <p className="text-xs text-slate-500 mt-1.5 text-center">
            Upload character portrait, landscape, or 3D render to bring to life
          </p>

          {(validationError || error) && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-3 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
