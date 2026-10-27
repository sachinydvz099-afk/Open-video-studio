import React, { useState } from 'react';
import { Sparkles, BookOpen, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { VALIDATION_LIMITS } from '../../utils/validators';

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (value: string) => void;
  onOpenExamples: () => void;
  mode?: 'text-to-video' | 'image-to-video';
  error?: string;
}

const INSPIRATIONAL_PROMPTS = [
  'Cinematic wide drone shot flying through a rain-drenched futuristic neo-Tokyo metropolis, towering holographic neon billboards, volumetric blue and amber smog, flying vehicles darting between skyscrapers, 8k masterpiece',
  'An ethereal wooden galleon sailing smoothly through shimmering magenta and gold cosmic dust clouds, stars twinkling, celestial light rays, hyper-realistic physics',
  'Macro slow motion cinematography of translucent glowing blue and violet jellyfish pulsating in the deep midnight oceanic abyss, radiant sparkles, 4k ultra-detailed',
  'Hyper-realistic drone flying over jagged snow-capped mountain peaks surrounded by sea of clouds, evergreen pine forest below, sunrise volumetric rays',
  'A vintage 1970s Porsche 911 Turbo speeding down a wet coastal highway at dusk, orange taillights reflecting on asphalt, cinematic anamorphic lens flare',
  'Close-up cinematic portrait of an ancient samurai in ornate black lacquer armor under falling cherry blossoms, intense piercing eyes, 35mm film grain',
];

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  onPromptChange,
  negativePrompt,
  onNegativePromptChange,
  onOpenExamples,
  mode = 'text-to-video',
  error,
}) => {
  const [showNegative, setShowNegative] = useState<boolean>(false);

  const handleRandomize = () => {
    const random = INSPIRATIONAL_PROMPTS[Math.floor(Math.random() * INSPIRATIONAL_PROMPTS.length)];
    onPromptChange(random);
  };

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>{mode === 'image-to-video' ? 'Motion Prompt' : 'Cinematic Prompt'}</span>
          <span className="text-amber-400">*</span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRandomize}
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/20 transition-colors cursor-pointer"
            title="Insert a randomized cinematic prompt"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Inspire Me</span>
          </button>
          <button
            type="button"
            onClick={onOpenExamples}
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-studio-surface hover:bg-studio-hover px-2.5 py-1 rounded-lg border border-studio-border transition-colors cursor-pointer"
          >
            <BookOpen className="w-3 h-3 text-cyan-400" />
            <span>Prompt Library</span>
          </button>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          rows={4}
          maxLength={VALIDATION_LIMITS.MAX_PROMPT_LENGTH}
          placeholder={
            mode === 'image-to-video'
              ? 'Describe camera motion and animation (e.g. "Slow cinematic push in on the subject, gentle wind rustling hair, soft volumetric sun rays...")'
              : 'Describe the scene, motion, lighting, and camera style (e.g. "Cinematic drone shot flying through a glowing nebula, 35mm film...")'
          }
          className={`w-full p-4 rounded-xl bg-studio-card/80 border text-slate-100 placeholder-slate-500 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-rose-500/60 focus:ring-rose-500/40'
              : 'border-studio-border focus:border-amber-500/50 focus:ring-amber-500/20'
          }`}
        />
        <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 px-1">
          {error ? (
            <span className="text-rose-400 font-medium">{error}</span>
          ) : (
            <span>Be descriptive about camera motion, atmosphere, and lighting.</span>
          )}
          <span>
            {prompt.length} / {VALIDATION_LIMITS.MAX_PROMPT_LENGTH}
          </span>
        </div>
      </div>

      {/* Negative Prompt Accordion */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowNegative(!showNegative)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          {showNegative ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>Negative Prompt (Optional)</span>
        </button>

        {showNegative && (
          <div className="mt-2 animate-in fade-in duration-150">
            <textarea
              value={negativePrompt}
              onChange={(e) => onNegativePromptChange(e.target.value)}
              rows={2}
              maxLength={VALIDATION_LIMITS.MAX_NEGATIVE_PROMPT_LENGTH}
              placeholder="Elements to avoid: blurry, distorted, jitter, low quality, oversaturated, static, artifacts..."
              className="w-full p-3 rounded-xl bg-studio-surface/60 border border-studio-border text-slate-200 placeholder-slate-500 text-xs resize-y focus:outline-none focus:border-studio-border"
            />
          </div>
        )}
      </div>
    </div>
  );
};
