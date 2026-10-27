import React from 'react';
import { Modal } from '../common/Modal';
import { VideoPlayer } from '../player/VideoPlayer';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CreationRecord } from '../../store/generationHistory';
import { formatRelativeTime } from '../../utils/formatters';
import { Sparkles, Trash2, Heart, Download } from 'lucide-react';

interface VideoDetailModalProps {
  creation: CreationRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onReuseSettings: (creation: CreationRecord) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export const VideoDetailModal: React.FC<VideoDetailModalProps> = ({
  creation,
  isOpen,
  onClose,
  onReuseSettings,
  onToggleFavorite,
  onDelete,
}) => {
  if (!creation) return null;

  const handleDownload = () => {
    if (!creation.videoUrl) return;
    const a = document.createElement('a');
    a.href = creation.videoUrl;
    a.download = `open-video-${creation.id}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={creation.title}
      subtitle={`Generated ${formatRelativeTime(creation.createdAt)} via ${creation.modelId}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Video Player */}
        <div className="w-full">
          <VideoPlayer
            src={creation.videoUrl}
            isSimulated={creation.isSimulated}
            aspectRatio={creation.aspectRatio}
            prompt={creation.prompt}
            autoPlay
          />
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-studio-surface/50 border border-white/5 text-xs">
          <div>
            <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px] mb-1">
              Model
            </span>
            <span className="font-mono text-slate-200 font-medium">{creation.modelId}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px] mb-1">
              Format & Duration
            </span>
            <span className="font-mono text-slate-200 font-medium">
              {creation.aspectRatio} • {creation.resolution} • {creation.durationSeconds}s @ {creation.fps}fps
            </span>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px] mb-1">
              Generation Engine
            </span>
            <Badge variant={creation.isSimulated ? 'amber' : 'emerald'} size="sm">
              {creation.isSimulated ? 'Demo Simulation' : 'Live Inference'}
            </Badge>
          </div>
        </div>

        {/* Prompt Card */}
        <div className="p-4 rounded-xl bg-studio-surface/80 border border-studio-border space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Prompt
          </h4>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">{creation.prompt}</p>

          {creation.negativePrompt && (
            <div className="pt-2 border-t border-white/5">
              <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Negative Prompt
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{creation.negativePrompt}</p>
            </div>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(creation.id)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
                creation.isFavorite
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${creation.isFavorite ? 'fill-current' : ''}`} />
              <span>{creation.isFavorite ? 'Favorited' : 'Favorite'}</span>
            </button>

            <button
              onClick={() => {
                onDelete(creation.id);
                onClose();
              }}
              className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={handleDownload}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download MP4
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onReuseSettings(creation);
                onClose();
              }}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Reuse Settings in Studio
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
