import React, { useState, useEffect } from 'react';
import { useStudio } from '../../store/appState';
import { PromptEditor } from './PromptEditor';
import { AspectRatioPicker } from './AspectRatioPicker';
import { ModelSelector } from './ModelSelector';
import { ExamplePromptsModal } from './ExamplePromptsModal';
import { GenerationProgressCard } from './GenerationProgressCard';
import { ProviderSelectorBar } from './ProviderSelectorBar';
import { VideoPlayer } from '../player/VideoPlayer';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { AspectRatio, GenerationRequest } from '../../providers/types';
import { getModelById, ModelVariant } from '../../models/registry';
import { validatePrompt, validateSteps, validateGuidanceScale } from '../../utils/validators';
import { Sliders, Sparkles, Film, Dna, Info, Check } from 'lucide-react';

interface TextToVideoWorkspaceProps {
  onOpenModelModal?: (model: ModelVariant) => void;
}

export const TextToVideoWorkspace: React.FC<TextToVideoWorkspaceProps> = ({ onOpenModelModal }) => {
  const {
    submitGeneration,
    isGenerating,
    currentJob,
    activeRequest,
    prefillRequest,
    clearPrefill,
    reuseSettings,
  } = useStudio();

  // Workspace form state
  const [prompt, setPrompt] = useState<string>(
    'Cinematic wide drone shot flying through a rain-drenched futuristic neo-Tokyo metropolis, towering holographic neon billboards, volumetric blue and amber smog, flying vehicles darting between skyscrapers, 8k masterpiece'
  );
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('wan2.1-t2v-14b');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<'480p' | '720p' | '1080p'>('720p');
  const [durationSeconds, setDurationSeconds] = useState<number>(5);
  const [fps, setFps] = useState<number>(16);
  const [inferenceSteps, setInferenceSteps] = useState<number>(30);
  const [guidanceScale, setGuidanceScale] = useState<number>(5.0);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [isRandomSeed, setIsRandomSeed] = useState<boolean>(true);

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showExamplesModal, setShowExamplesModal] = useState<boolean>(false);
  const [promptError, setPromptError] = useState<string | undefined>(undefined);

  // Consume prefill request if any
  useEffect(() => {
    if (prefillRequest && prefillRequest.mode === 'text-to-video') {
      if (prefillRequest.prompt) setPrompt(prefillRequest.prompt);
      if (prefillRequest.negativePrompt) setNegativePrompt(prefillRequest.negativePrompt);
      if (prefillRequest.modelId) setSelectedModelId(prefillRequest.modelId);
      if (prefillRequest.aspectRatio) setAspectRatio(prefillRequest.aspectRatio);
      if (prefillRequest.resolution) setResolution(prefillRequest.resolution as any);
      if (prefillRequest.durationSeconds) setDurationSeconds(prefillRequest.durationSeconds);
      if (prefillRequest.fps) setFps(prefillRequest.fps);
      if (prefillRequest.seed !== undefined) {
        setSeed(prefillRequest.seed);
        setIsRandomSeed(false);
      }
      clearPrefill();
    }
  }, [prefillRequest, clearPrefill]);

  // Adjust resolution if model doesn't support 720p
  useEffect(() => {
    const model = getModelById(selectedModelId);
    if (model && !model.nativeResolutions.includes(resolution)) {
      setResolution(model.defaultResolution);
    }
  }, [selectedModelId, resolution]);

  const handleGenerate = async () => {
    const val = validatePrompt(prompt);
    if (!val.isValid) {
      setPromptError(val.error);
      return;
    }
    setPromptError(undefined);

    const actualSeed = isRandomSeed ? Math.floor(Math.random() * 2147483647) : seed || 42;

    const request: GenerationRequest = {
      id: `t2v-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      mode: 'text-to-video',
      modelId: selectedModelId,
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      aspectRatio,
      durationSeconds,
      resolution,
      fps,
      inferenceSteps,
      guidanceScale,
      seed: actualSeed,
      createdAt: Date.now(),
    };

    await submitGeneration(request);
  };

  const handleApplyExample = (
    exPrompt: string,
    exNegPrompt?: string,
    modelId?: string,
    ratio?: AspectRatio
  ) => {
    setPrompt(exPrompt);
    if (exNegPrompt) setNegativePrompt(exNegPrompt);
    if (modelId) setSelectedModelId(modelId);
    if (ratio) setAspectRatio(ratio);
  };

  const selectedModel = getModelById(selectedModelId);

  return (
    <div className="space-y-6">
      {/* Top Banner Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-studio-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              Text-to-Video Studio
            </h1>
            <Badge variant="amber" size="md">
              Wan2.1 Powered
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Turn cinematic prompts into high-temporal-consistency video with open-source diffusion transformers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" size="sm">
            <Film className="w-3 h-3 text-amber-400" />
            <span>Apache 2.0 Open Weights</span>
          </Badge>
          <Badge variant="slate" size="sm">
            Zero ₹ Cost
          </Badge>
        </div>
      {/* Generation Engine Switcher Bar */}
      <ProviderSelectorBar />

      {/* Main Two-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Prompt Editor */}
          <div className="p-5 rounded-2xl bg-studio-card border border-studio-border shadow-xl space-y-4">
            <PromptEditor
              prompt={prompt}
              onPromptChange={(v) => {
                setPrompt(v);
                if (promptError) setPromptError(undefined);
              }}
              negativePrompt={negativePrompt}
              onNegativePromptChange={setNegativePrompt}
              onOpenExamples={() => setShowExamplesModal(true)}
              mode="text-to-video"
              error={promptError}
            />
          </div>

          {/* Model Selector */}
          <div className="p-5 rounded-2xl bg-studio-card border border-studio-border shadow-xl">
            <ModelSelector
              mode="text-to-video"
              selectedModelId={selectedModelId}
              onSelectModel={setSelectedModelId}
              onOpenModelInfo={onOpenModelModal}
            />
          </div>

          {/* Aspect Ratio Picker */}
          <div className="p-5 rounded-2xl bg-studio-card border border-studio-border shadow-xl">
            <AspectRatioPicker
              value={aspectRatio}
              onChange={setAspectRatio}
              supportedRatios={selectedModel?.supportedAspectRatios}
            />
          </div>

          {/* Resolution & Output Duration */}
          <div className="p-5 rounded-2xl bg-studio-card border border-studio-border shadow-xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Resolution */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Resolution
                </label>
                <div className="flex items-center gap-2">
                  {(['480p', '720p'] as const).map((res) => {
                    const isSupported = selectedModel?.nativeResolutions.includes(res);
                    const isSelected = resolution === res;
                    return (
                      <button
                        key={res}
                        type="button"
                        disabled={!isSupported}
                        onClick={() => setResolution(res)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                            : 'bg-studio-surface border-studio-border text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {res}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Duration
                </label>
                <select
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl text-xs font-mono bg-studio-surface border border-studio-border text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value={3}>3 Seconds (~48 Frames)</option>
                  <option value={5}>5 Seconds (~81 Frames)</option>
                </select>
              </div>

              {/* Frame Rate */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Frame Rate (FPS)
                </label>
                <select
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl text-xs font-mono bg-studio-surface border border-studio-border text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value={16}>16 FPS (Wan Native)</option>
                  <option value={24}>24 FPS (Cinematic)</option>
                </select>
              </div>
            </div>

            {/* Advanced Settings Collapsible */}
            <div className="pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showAdvanced ? 'Hide Advanced Inference Controls' : 'Show Advanced Inference Controls'}</span>
              </button>

              {showAdvanced && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                  {/* Inference Steps */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Inference Steps</span>
                      <span className="font-mono text-amber-400">{inferenceSteps}</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={50}
                      step={1}
                      value={inferenceSteps}
                      onChange={(e) => setInferenceSteps(Number(e.target.value))}
                      className="w-full h-1.5 bg-studio-surface rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* Guidance Scale */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Guidance Scale (CFG)</span>
                      <span className="font-mono text-amber-400">{guidanceScale.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min={2.0}
                      max={12.0}
                      step={0.5}
                      value={guidanceScale}
                      onChange={(e) => setGuidanceScale(Number(e.target.value))}
                      className="w-full h-1.5 bg-studio-surface rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* Seed */}
                  <div className="sm:col-span-2 flex items-center justify-between gap-4 p-3 rounded-xl bg-studio-surface/50 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Dna className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-300">Randomized Seed</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRandomSeed(!isRandomSeed)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                        isRandomSeed
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/10'
                      }`}
                    >
                      {isRandomSeed ? 'AUTO RANDOM' : 'FIXED SEED'}
                    </button>
                  </div>
                </div>
              )}
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
              {isGenerating ? 'Synthesizing Latents...' : 'Generate AI Video'}
            </Button>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              ⚡ Powered by Realistic AI Video Engine. Real photorealistic AI video rendered directly to WebM/MP4.
            </p>
          </div>
        </div>

        {/* Right Column: Live Output & Player (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Generation Progress Card */}
          <GenerationProgressCard />

          {/* Video Player Output */}
          {currentJob?.videoUrl ? (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Generated Result
                </h3>
                <Badge variant={currentJob.isSimulated ? 'amber' : 'emerald'} size="sm">
                  {currentJob.isSimulated ? 'Demo Output' : 'Live Inference'}
                </Badge>
              </div>

              <VideoPlayer
                src={currentJob.videoUrl}
                title={prompt.slice(0, 50) + '...'}
                prompt={prompt}
                isSimulated={currentJob.isSimulated}
                aspectRatio={aspectRatio}
                autoPlay
              />
            </div>
          ) : (
            /* Empty State Preview Screen */
            <div className="rounded-2xl border border-dashed border-studio-border bg-studio-card/60 p-8 flex flex-col items-center justify-center text-center min-h-[380px]">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
                <Film className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">Studio Viewport Idle</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                Configure your prompt and model parameters on the left, then click{' '}
                <span className="text-amber-400 font-medium">Generate AI Video</span> to render.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Example Prompts Modal */}
      <ExamplePromptsModal
        isOpen={showExamplesModal}
        onClose={() => setShowExamplesModal(false)}
        onSelectPrompt={handleApplyExample}
      />
    </div>
  );
};
