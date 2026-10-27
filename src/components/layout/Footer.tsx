import React from 'react';
import { Badge } from '../common/Badge';
import { Film, Heart, Github, ExternalLink, ShieldCheck } from 'lucide-react';
import { useStudio } from '../../store/appState';

export const Footer: React.FC = () => {
  const { setActiveTab } = useStudio();

  return (
    <footer className="w-full border-t border-studio-border bg-studio-bg py-8 mt-16 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Film className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="font-bold text-slate-200">Open Video Studio</span>
              <span className="text-slate-500 mx-2">•</span>
              <span>Open-Source AI Video Generation SaaS</span>
            </div>
          </div>

          {/* Center Links */}
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveTab('studio-t2v')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Text-to-Video
            </button>
            <button
              onClick={() => setActiveTab('studio-i2v')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Image-to-Video
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Model Registry
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Licenses & Attribution
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Provider Configuration
            </button>
          </div>

          {/* Right Badges */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" size="sm">
              ₹0 Budget
            </Badge>
            <Badge variant="amber" size="sm">
              MIT / Apache 2.0
            </Badge>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
          <p>
            Wan2.1 weights and architecture copyright © Alibaba Cloud / Wan-AI. CogVideoX copyright © THUDM.
          </p>
          <p className="flex items-center gap-1">
            Built with React, Vite, TypeScript & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
};
