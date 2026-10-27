import React, { useState, useEffect } from 'react';
import { useStudio } from '../../store/appState';
import { ImageDropzone } from './ImageDropzone';
import { PromptEditor } from './PromptEditor';
import { ModelSelector } from './ModelSelector';
import { GenerationProgressCard } from './GenerationProgressCard';
import { ProviderSelectorBar } from './ProviderSelectorBar';
import { VideoPlayer } from '../player/VideoPlayer';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ExamplePromptsModal } from './ExamplePromptsModal';
import { AspectRatio, CameraMotion, GenerationRequest, SourceImageData } from '../../providers/types';
import { getModelById, ModelVariant } from '../../models/registry';
import { validatePrompt } from '../../utils/validators';
import {
  Sparkles,
  MoveHorizontal,
  Compass,
  Film,
  ZoomIn,
  ZoomOut,
  ArrowRight,
  ArrowLeft,
  CircleDot,
  RotateCw,
} from 'lucide-react';

interface ImageToVideoWorkspaceProps {
  onOpenModelModal?: (model: ModelVariant) => void;
}

export const ImageToVideoWorkspace: React.FC<ImageToVideoWorkspaceProps> = ({
  onOpenModelModal,
}) => {
  const {
    submitGeneration,
    isGenerating,
    currentJob,
    prefillRequest,
    clearPrefill,
  } = useStudio();

  // Form states
  const [sourceImage, setSourceImage] = useState<SourceImageData | null>(null);
  const [motionPrompt, setMotionPrompt] = useState<string>(
    'The subject slowly blinks and smiles gently towards the camera, autumn leaves floating past, warm atmospheric golden sunlight'
  );
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('wan2.1-i2v-14b-720p');
  const [motionStrength, setMotionStrength] = useState<number>(6); // 1 to 10
  const [cameraMotion, setCameraMotion] = useState<CameraMotion>('zoom_in');
  const [durationSeconds, setDurationSeconds] = useState<number>(5);
  const [fps, setFps] = useState<number>(16);

  const [imageError, setImageError] = useState<string | undefined>(undefined);
  const [promptError, setPromptError] = useState<string | undefined>(undefined);
  const [showExamplesModal, setShowExamplesModal] = useState<boolean>(false);

  // Consume prefill if any
  useEffect(() => {
    if (prefillRequest && prefillRequest.mode === 'image-to-video') {
      if (prefillRequest.prompt) setMotionPrompt(prefillRequest.prompt);
      if (prefillRequest.negativePrompt) setNegativePrompt(prefillRequest.negativePrompt);
      if (prefillRequest.modelId) setSelectedModelId(prefillRequest.modelId);
      if (prefillRequest.motionStrength) setMotionStrength(prefillRequest.motionStrength);
      if (prefillRequest.durationSeconds) setDurationSeconds(prefillRequest.durationSeconds);
      if (prefillRequest.fps) setFps(prefillRequest.fps);
      clearPrefill();
    }
  }, [prefillRequest, clearPrefill]);

  const cameraOptions: { motion: CameraMotion; label: string; icon: React.ReactNode }[] = [
    { motion: 'zoom_in', label: 'Push In', icon: <ZoomIn className="w-4 h-4" /> },
    { motion: 'zoom_out', label: 'Pull Back', icon: <ZoomOut className="w-4 h-4" /> },
    { motion: 'pan_left', label: 'Pan Left', icon: <ArrowLeft className="w-4 h-4" /> },
    { motion: 'pan_right', label: 'Pan Right', icon: <ArrowRight className="w-4 h-4" /> },
    { motion: 'orbit', label: 'Orbit', icon: <RotateCw className="w-4 h-4" /> },
    { motion: 'static', label: 'Static', icon: <CircleDot className="w-4 h-4" /> },
  ];

  const handleGenerate = async () => {
    if (!sourceImage) {
      setImageError('Please upload a source image before generating video.');
      return;
    }
    setImageError(undefined);

    const val = validatePrompt(motionPrompt);
    if (!val.isValid) {
      setPromptError(val.error);
      return;
    }
    setPromptError(undefined);

    const model = getModelById(selectedModelId);
    const resolution = model?.defaultResolution || '720p';

    // Determine aspect ratio from image dimensions or fallback 16:9
    let detectedRatio: AspectRatio = '16:9';
    if (sourceImage.width && sourceImage.height) {
      const imgRatio = sourceImage.width / sourceImage.height;
      if (imgRatio >= 1.5) detectedRatio = '16:9';
      else if (imgRatio <= 0.7) detectedRatio = '9:16';
      else if (imgRatio >= 0.9 && imgRatio <= 1.1) detectedRatio = '1:1';
      else if (imgRatio > 1.1 && imgRatio < 1.5) detectedRatio = '4:3';
    }

    const request: GenerationRequest = {
      id: `i2v-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      mode: 'image-to-video',
      modelId: selectedModelId,
      prompt: motionPrompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      sourceImage,
      aspectRatio: detectedRatio,
      durationSeconds,
      resolution,
      fps,
      motionStrength,
      cameraMotion,
      createdAt: Date.now(),
    };

    await submitGeneration(request);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-studio-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              Image-to-Video Studio
            </h1>
            <Badge variant="cyan" size="md">
              Wan2.1-I2V
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Animate static photos with natural fluid dynamics, camera pan & zoom trajectories, and identity preservation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" size="sm">
            <Film className="w-3 h-3 text-cyan-400" />
            <span>Preserve Subject Identity</span>
          </Badge>
          <Badge variant="slate" size="sm">
            Zero ₹ Cost
          </Badge>
        </div>
      </div>

      {/* Generation Engine Switcher Bar */}
      <ProviderSelectorBar />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Image Upload Zone */}
          <div className="p-5 rounded-2xl bg-studio-card border border-studio-border shadow-xl">
            <ImageDropzone
              image={sourceImage}
              onImageChange={(img) => {
                setSourceImage(img);
                if (imageError) setImageError(undefined);
              }}
              error={imageError}
            />
          </div>

          {/* Motion Prompt Editor */}
          <div className="p-5 rounded-2xl bg-studio-card border border-studio-border shadow-xl">
            <PromptEditor
              prompt={motionPrompt}
              onPromptChange={(v) => {
                setMotionPrompt(v);
                if (promptError) setPromptError(undefined);
              }}
              negativePrompt={negativePrompt}
              onNegativePromptChange={setNegativePrompt}
              onOpenExamples={() => setShowExamplesModal(true)}
              mode="image-to-video"
              error={promptError}
            />
          </div>

          {/* Model Selector */}
          <div className="p-5 rounded-2xl bg-studio-card border border-studio-border shadow-xl">
            <ModelSelector
              mode="image-to-video"
              selectedModelId={selectedModelId}
              onSelectModel={setSelectedModelId}
              onOpenModelInfo={onOpenModelModal}
            />
          </div>

          {/* Camera Motion & Motion Strength Controls */}
          <div className="p-5 rounded-2xl bg-studio-card border border-studio-border shadow-xl space-y-5">
            {/* Camera Trajectory */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Camera Motion Trajectory</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {cameraOptions.map((opt) => {
                  const isSelected = cameraMotion === opt.motion;
                  return (
                    <button
                      key={opt.motion}
                      type="button"
                      onClick={() => setCameraMotion(opt.motion)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10 font-semibold'
                          : 'bg-studio-surface border-studio-border text-slate-400 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <span className="mb-1">{opt.icon}</span>
                      <span className="text-[11px] truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Motion Intensity Bucket */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <MoveHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Motion Intensity</span>
                </span>
                <span className="font-mono text-amber-400 font-bold">{motionStrength} / 10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={motionStrength}
                onChange={(e) => setMotionStrength(Number(e.target.value))}
                className="w-full h-1.5 bg-studio-surface rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Subtle / Subtle Ambient</span>
                <span>Balanced</span>
                <span>Dynamic / High Kinetic</span>
              </div>
            </div>
          </div>

          {/* Action Generate Button */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-amber-500/25"
              onClick={handleGenerate}
              isLoading={isGenerating}
              leftIcon={<Sparkles className="w-5 h-5 fill-current" />}
            >
              {isGenerating ? 'Synthesizing Animation...' : 'Animate Image to Video'}
            </Button>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              ⚡ Powered by Realistic AI Video Engine. Directly animates your uploaded image with selected 3D camera trajectory.
            </p>
          </div>
        </div>

        {/* Right Column: Generation Progress & Player (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <GenerationProgressCard />

          {/* Result Player */}
          {currentJob?.videoUrl ? (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Animated Result
                </h3>
                <Badge variant={currentJob.isSimulated ? 'amber' : 'emerald'} size="sm">
                  {currentJob.isSimulated ? 'Demo Output' : 'Live Inference'}
                </Badge>
              </div>

              <VideoPlayer
                src={currentJob.videoUrl}
                title={motionPrompt.slice(0, 50) + '...'}
                prompt={motionPrompt}
                isSimulated={currentJob.isSimulated}
                autoPlay
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-studio-border bg-studio-card/60 p-8 flex flex-col items-center justify-center text-center min-h-[380px]">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
                <Film className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">Animation Viewport Idle</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                Upload your initial frame and describe the intended animation on the left to start generating.
              </p>
            </div>
          )}
        </div>
      </div>

      <ExamplePromptsModal
        isOpen={showExamplesModal}
        onClose={() => setShowExamplesModal(false)}
        onSelectPrompt={(p, np) => {
          setMotionPrompt(p);
          if (np) setNegativePrompt(np);
        }}
      />
    </div>
  );
};
