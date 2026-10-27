import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Sparkles, ArrowRight } from 'lucide-react';
import { AspectRatio } from '../../providers/types';

export interface ExamplePromptItem {
  id: string;
  category: 'Sci-Fi' | 'Nature' | 'Cinematic' | 'Fantasy' | 'Macro' | 'Anime';
  title: string;
  prompt: string;
  negativePrompt?: string;
  recommendedModelId: string;
  aspectRatio: AspectRatio;
}

const EXAMPLE_PROMPTS: ExamplePromptItem[] = [
  {
    id: 'ex-1',
    category: 'Sci-Fi',
    title: 'Neon Cyberpunk Metropolis',
    prompt:
      'Cinematic wide drone shot flying through a rain-drenched futuristic neo-Tokyo metropolis, towering holographic neon billboards, volumetric blue and amber smog, flying vehicles darting between skyscrapers, 8k masterpiece',
    recommendedModelId: 'wan2.1-t2v-14b',
    aspectRatio: '16:9',
  },
  {
    id: 'ex-2',
    category: 'Fantasy',
    title: 'Cosmic Nebula Galleon',
    prompt:
      'An ethereal wooden galleon sailing smoothly through shimmering magenta and gold cosmic dust clouds, stars twinkling, celestial light rays, hyper-realistic physics',
    recommendedModelId: 'wan2.1-t2v-1.3b',
    aspectRatio: '16:9',
  },
  {
    id: 'ex-3',
    category: 'Macro',
    title: 'Bioluminescent Abyss Jellyfish',
    prompt:
      'Macro slow motion cinematography of translucent glowing blue and violet jellyfish pulsating in the deep midnight oceanic abyss, radiant sparkles, 4k ultra-detailed',
    recommendedModelId: 'ltx-video-0.9.1',
    aspectRatio: '9:16',
  },
  {
    id: 'ex-4',
    category: 'Nature',
    title: 'Misty Alpine Pine Valley',
    prompt:
      'Hyper-realistic drone flying over jagged snow-capped mountain peaks surrounded by sea of clouds, evergreen pine forest below, sunrise volumetric rays',
    recommendedModelId: 'cogvideox-5b',
    aspectRatio: '16:9',
  },
  {
    id: 'ex-5',
    category: 'Cinematic',
    title: 'Rainy Film Noir Street',
    prompt:
      'A lone detective wearing a classic trench coat standing on a wet asphalt alleyway under a flickering streetlamp, cigarette smoke curling into the foggy night air, anamorphic lens reflection, high contrast',
    recommendedModelId: 'wan2.1-t2v-14b',
    aspectRatio: '21:9',
  },
  {
    id: 'ex-6',
    category: 'Anime',
    title: 'Studio Ghibli Meadow Sunset',
    prompt:
      'Lush green hills blowing in a gentle summer breeze, vibrant wild sunflowers, towering cumulus clouds in warm pastel watercolor sky, Makoto Shinkai aesthetic, smooth anime animation',
    recommendedModelId: 'wan2.1-t2v-1.3b',
    aspectRatio: '16:9',
  },
  {
    id: 'ex-7',
    category: 'Macro',
    title: 'Crystalline Ice Formation',
    prompt:
      'Macro time-lapse of intricate crystalline ice frost blooming rapidly across a dark glass surface, prismatic light scattering, diamond sparkle, high fidelity',
    recommendedModelId: 'wan2.1-t2v-14b',
    aspectRatio: '1:1',
  },
  {
    id: 'ex-8',
    category: 'Sci-Fi',
    title: 'Orbital Space Station Docking',
    prompt:
      'Exterior shot of a giant torus orbital space station rotating above Earth with glowing blue atmospheric limb, shuttle docking sequence, hard industrial sci-fi lighting',
    recommendedModelId: 'wan2.1-t2v-14b',
    aspectRatio: '16:9',
  },
];

interface ExamplePromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string, negativePrompt?: string, modelId?: string, ratio?: AspectRatio) => void;
}

export const ExamplePromptsModal: React.FC<ExamplePromptsModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'Sci-Fi', 'Nature', 'Cinematic', 'Fantasy', 'Macro', 'Anime'];

  const filtered =
    selectedCategory === 'All'
      ? EXAMPLE_PROMPTS
      : EXAMPLE_PROMPTS.filter((p) => p.category === selectedCategory);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cinematic Prompt Library"
      subtitle="High-fidelity prompts curated for Wan2.1, LTX-Video, and CogVideoX."
      maxWidth="4xl"
    >
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-studio-surface text-slate-400 hover:text-white border border-studio-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between p-4 rounded-xl bg-studio-surface/60 border border-studio-border hover:border-amber-500/40 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {item.title}
                </span>
                <Badge variant="amber" size="sm">
                  {item.category}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.prompt}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-[11px] font-mono text-slate-500">Model: {item.recommendedModelId}</span>
              <button
                onClick={() => {
                  onSelectPrompt(item.prompt, item.negativePrompt, item.recommendedModelId, item.aspectRatio);
                  onClose();
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:translate-x-0.5 transition-all cursor-pointer"
              >
                <span>Use Prompt</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
