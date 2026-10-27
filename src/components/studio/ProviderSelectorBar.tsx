import React from 'react';
import { useStudio } from '../../store/appState';
import { ProviderType } from '../../providers/providerRegistry';
import { Sparkles, Globe, Server, Laptop, CheckCircle2 } from 'lucide-react';

export const ProviderSelectorBar: React.FC = () => {
  const { activeProviderType, setActiveProviderType } = useStudio();

  const options: {
    type: ProviderType;
    label: string;
    subtext: string;
    badge: string;
    badgeColor: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: 'realistic-ai',
      label: 'Realistic AI Engine',
      subtext: 'Photorealistic diffusion keyframes & 3D cinematic camera physics',
      badge: 'RECOMMENDED',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
    },
    {
      type: 'huggingface',
      label: 'Hugging Face Wan2.1',
      subtext: 'Direct connection to Hugging Face ZeroGPU Gradio spaces',
      badge: 'CLOUD GPU',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      icon: <Globe className="w-4 h-4 text-cyan-400" />,
    },
    {
      type: 'custom',
      label: 'ComfyUI / Local Workstation',
      subtext: 'Connects to your local RTX workstation at 127.0.0.1:8188',
      badge: 'LOCAL VRAM',
      badgeColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      icon: <Server className="w-4 h-4 text-violet-400" />,
    },
    {
      type: 'demo',
      label: 'Offline Simulation',
      subtext: 'Procedural canvas rendering with simulated GPU scheduler logs',
      badge: 'NO NETWORK',
      badgeColor: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      icon: <Laptop className="w-4 h-4 text-slate-400" />,
    },
  ];

  return (
    <div className="p-4 rounded-2xl bg-studio-card border border-studio-border shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Active Generation Engine
          </span>
          <span className="text-[11px] text-slate-500">
            • Select where your AI video is rendered
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {options.map((opt) => {
          const isSelected = activeProviderType === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => setActiveProviderType(opt.type)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : 'bg-studio-surface border-studio-border hover:border-slate-600 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {opt.icon}
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-slate-100' : 'text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {opt.subtext}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${opt.badgeColor}`}
                >
                  {opt.badge}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {opt.type === 'realistic-ai' ? '₹0 Free' : opt.type === 'demo' ? 'Offline' : 'GPU'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
