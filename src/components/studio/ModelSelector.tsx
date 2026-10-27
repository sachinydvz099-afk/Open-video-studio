import React from 'react';
import { ModelVariant, getModelsForMode } from '../../models/registry';
import { JobMode } from '../../providers/types';
import { Badge } from '../common/Badge';
import { Cpu, Scale, Film, Info } from 'lucide-react';

interface ModelSelectorProps {
  mode: JobMode;
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  onOpenModelInfo?: (model: ModelVariant) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  mode,
  selectedModelId,
  onSelectModel,
  onOpenModelInfo,
}) => {
  const models = getModelsForMode(mode);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          AI Video Model
        </label>
        <span className="text-[11px] text-slate-500 font-mono">
          {models.length} open-weights models available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {models.map((m) => {
          const isSelected = selectedModelId === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onSelectModel(m.id)}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/80 shadow-md shadow-amber-500/10'
                  : 'bg-studio-surface/80 border-studio-border hover:border-slate-600 hover:bg-studio-hover/70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'
                      }`}
                    />
                    <h4 className="text-xs font-bold text-slate-100">{m.name}</h4>
                  </div>
                  {m.isPopular && (
                    <Badge variant="amber" size="sm">
                      Popular
                    </Badge>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {m.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5 text-[10px]">
                <Badge variant="outline" size="sm">
                  <Scale className="w-2.5 h-2.5" />
                  <span>{m.license}</span>
                </Badge>
                <Badge variant="cyan" size="sm">
                  <Film className="w-2.5 h-2.5" />
                  <span>{m.defaultResolution}</span>
                </Badge>
                <Badge variant="slate" size="sm">
                  <Cpu className="w-2.5 h-2.5" />
                  <span>{m.vramRequirements.minimumVramGb}GB VRAM</span>
                </Badge>

                {onOpenModelInfo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenModelInfo(m);
                    }}
                    className="ml-auto text-slate-400 hover:text-amber-400 p-1 transition-colors"
                    title="View model architecture & specs"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
