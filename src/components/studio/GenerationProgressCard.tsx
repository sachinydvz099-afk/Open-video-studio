import React from 'react';
import { useStudio } from '../../store/appState';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Loader2,
  Clock,
  Layers,
  Cpu,
  AlertTriangle,
  RotateCcw,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

export const GenerationProgressCard: React.FC = () => {
  const {
    currentJob,
    activeRequest,
    isGenerating,
    cancelGeneration,
    retryGeneration,
    activeProviderType,
  } = useStudio();

  if (!currentJob && !isGenerating) return null;

  const status = currentJob?.status || 'queued';
  const step = currentJob?.step;
  const progress = step?.progressPercent ?? 0;
  const isFailed = status === 'failed';
  const isSucceeded = status === 'succeeded';
  const isCancelled = status === 'cancelled';

  const pipelineStages = [
    { key: 'queued', label: 'Queued' },
    { key: 'allocating_resources', label: 'GPU Allocate' },
    { key: 'loading_weights', label: 'Embeddings' },
    { key: 'denoising_latents', label: 'Denoise DiT' },
    { key: 'interpolating_frames', label: '3D VAE' },
    { key: 'encoding_mp4', label: 'Encode' },
  ];

  const currentStageIndex = step
    ? pipelineStages.findIndex((s) => s.key === step.phase)
    : 0;

  return (
    <div
      role="region"
      aria-label="Generation Status"
      className="rounded-2xl border border-studio-border bg-studio-card/95 backdrop-blur-xl p-5 shadow-2xl relative overflow-hidden"
    >
      {/* Top ambient glow banner */}
      <div
        className={`absolute top-0 inset-x-0 h-1 ${
          isFailed
            ? 'bg-rose-500'
            : isSucceeded
            ? 'bg-emerald-500'
            : isCancelled
            ? 'bg-slate-500'
            : 'bg-gradient-to-r from-amber-500 via-cyan-400 to-amber-500 animate-shimmer'
        }`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          {isGenerating ? (
            <div className="relative">
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              <span className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping" />
            </div>
          ) : isFailed ? (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          ) : isCancelled ? (
            <XCircle className="w-5 h-5 text-slate-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}

          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>
                {isGenerating
                  ? 'Synthesizing Video Frames...'
                  : isFailed
                  ? 'Generation Failed'
                  : isCancelled
                  ? 'Generation Cancelled'
                  : 'Generation Completed'}
              </span>
              {currentJob?.isSimulated && (
                <Badge variant="amber" size="sm">
                  Demo Simulation
                </Badge>
              )}
            </h3>
            {activeRequest && (
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                Model: <span className="text-slate-200 font-mono">{activeRequest.modelId}</span> •{' '}
                {activeRequest.resolution} • {activeRequest.durationSeconds}s
              </p>
            )}
          </div>
        </div>

        {/* Action Controls: Cancel / Retry */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isGenerating && (
            <Button
              variant="outline"
              size="sm"
              onClick={cancelGeneration}
              className="text-xs border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
            >
              Cancel Job
            </Button>
          )}

          {(isFailed || isCancelled) && (
            <Button
              variant="primary"
              size="sm"
              onClick={retryGeneration}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Retry
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>{step?.message || 'Processing in engine runner...'}</span>
          </span>
          <span className="text-amber-400 font-bold">{progress}%</span>
        </div>

        <div className="h-2 w-full bg-studio-surface rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isFailed
                ? 'bg-rose-500'
                : isCancelled
                ? 'bg-slate-600'
                : isSucceeded
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-lg shadow-amber-500/50'
            }`}
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
      </div>

      {/* Pipeline Stage Badges */}
      <div className="hidden sm:grid grid-cols-6 gap-1.5 pt-2 border-t border-white/5">
        {pipelineStages.map((stg, idx) => {
          const isPassed = isSucceeded || (!isFailed && !isCancelled && idx <= currentStageIndex);
          const isCurrent = !isFailed && !isCancelled && idx === currentStageIndex && isGenerating;

          return (
            <div
              key={stg.key}
              className={`flex items-center justify-center py-1.5 px-2 rounded-lg text-[10px] font-mono font-medium transition-colors ${
                isCurrent
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : isPassed
                  ? 'bg-white/5 text-slate-300'
                  : 'text-slate-600'
              }`}
            >
              <span>{stg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Error Details */}
      {isFailed && currentJob?.error && (
        <div className="mt-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
          <p className="font-semibold text-rose-200">{currentJob.error.message}</p>
          {currentJob.error.details && (
            <p className="text-rose-400/90 mt-1 font-mono text-[11px]">{currentJob.error.details}</p>
          )}
        </div>
      )}
    </div>
  );
};
