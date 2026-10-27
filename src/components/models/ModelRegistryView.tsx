import React, { useState } from 'react';
import { MODEL_REGISTRY, ModelVariant } from '../../models/registry';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useStudio } from '../../store/appState';
import {
  Cpu,
  Scale,
  ExternalLink,
  BookOpen,
  Film,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
} from 'lucide-react';

export const ModelRegistryView: React.FC = () => {
  const { setActiveTab, reuseSettings } = useStudio();
  const [selectedFamily, setSelectedFamily] = useState<string>('All');

  const families = ['All', 'Wan2.1', 'LTX-Video', 'CogVideoX'];

  const filteredModels =
    selectedFamily === 'All'
      ? MODEL_REGISTRY
      : MODEL_REGISTRY.filter((m) => m.family === selectedFamily);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-studio-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              Open-Source Model Registry
            </h1>
            <Badge variant="amber" size="md">
              Verified Capabilities
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audited open weights video diffusion models with architecture breakdowns, licenses, VRAM benchmarks, and ComfyUI workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyan" size="sm">
            Zero Commercial Lock-in
          </Badge>
        </div>
      </div>

      {/* Family Filter */}
      <div className="flex items-center gap-2">
        {families.map((fam) => (
          <button
            key={fam}
            onClick={() => setSelectedFamily(fam)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedFamily === fam
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-studio-surface border border-studio-border text-slate-400 hover:text-white'
            }`}
          >
            {fam}
          </button>
        ))}
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            className="flex flex-col justify-between p-6 rounded-2xl bg-studio-card border border-studio-border hover:border-amber-500/40 shadow-xl transition-all space-y-5"
          >
            <div>
              {/* Title & Creator */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">{model.name}</h3>
                    {model.isPopular && (
                      <Badge variant="amber" size="sm">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    Created by {model.providerCreator}
                  </p>
                </div>
                <Badge variant={model.commercialUse ? 'emerald' : 'slate'} size="sm">
                  {model.license}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mt-2 mb-4">
                {model.description}
              </p>

              {/* Architecture & Specs Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-studio-surface/80 border border-white/5 text-xs font-mono mb-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Parameters</span>
                  <span className="text-slate-200 font-semibold">{model.parameters}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Resolution</span>
                  <span className="text-slate-200 font-semibold">{model.nativeResolutions.join(', ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Frames / Duration</span>
                  <span className="text-slate-200 font-semibold">
                    {model.maxFrames}f ({model.durationSeconds}s)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Native FPS</span>
                  <span className="text-slate-200 font-semibold">{model.nativeFps} FPS</span>
                </div>
              </div>

              {/* Hardware Requirements */}
              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1 text-xs mb-4">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>
                    Hardware: Min {model.vramRequirements.minimumVramGb}GB VRAM (Rec:{' '}
                    {model.vramRequirements.recommendedVramGb}GB)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {model.vramRequirements.quantizedNote}
                </p>
              </div>

              {/* Recommended Prompts */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Optimized Benchmark Prompt
                </span>
                <p className="text-xs text-slate-400 italic bg-black/40 p-2.5 rounded-lg border border-white/5">
                  "{model.recommendedPrompts[0]}"
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <a
                  href={`https://huggingface.co/${model.huggingFaceRepo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hugging Face Hub</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>

                {model.paperUrl && (
                  <a
                    href={model.paperUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span>Paper / GitHub</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                )}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setActiveTab(model.supportedModes.includes('text-to-video') ? 'studio-t2v' : 'studio-i2v');
                }}
                leftIcon={<Sparkles className="w-3.5 h-3.5 fill-current" />}
              >
                Use in Studio
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Local Inference Guide Card (ComfyUI / RTX Workstation) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-studio-surface via-studio-card to-studio-surface border border-studio-border space-y-4">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
          <Terminal className="w-4 h-4" />
          <span>Local Self-Hosted Inference Setup (ComfyUI + Wan2.1)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Open Video Studio can communicate directly with your local GPU over HTTP with zero cloud costs.
          To run Wan2.1 1.3B or 14B locally:
        </p>
        <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 font-mono">
          <li>Install ComfyUI with Python 3.10 / 3.11 and PyTorch with CUDA 12.4+.</li>
          <li>Clone <code className="text-amber-400">ComfyUI-WanVideoWrapper</code> or official nodes.</li>
          <li>Download the FP8 or GGUF quantized checkpoint into <code className="text-amber-400">ComfyUI/models/checkpoints/</code>.</li>
          <li>Start ComfyUI with CORS enabled: <code className="text-amber-400">python main.py --listen 127.0.0.1 --port 8188 --enable-cors-header</code>.</li>
          <li>In Open Video Studio Settings, select "Custom / ComfyUI Local Server" and enter <code className="text-amber-400">http://127.0.0.1:8188</code>.</li>
        </ol>
      </div>
    </div>
  );
};
