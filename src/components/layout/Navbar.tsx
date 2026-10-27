import React, { useState } from 'react';
import { useStudio, AppTab } from '../../store/appState';
import { Badge } from '../common/Badge';
import {
  Film,
  Video,
  Image as ImageIcon,
  Layers,
  Cpu,
  Settings,
  Info,
  Menu,
  X,
  Github,
  Zap,
  Globe,
  Radio,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeProviderType,
    creations,
    isGenerating,
  } = useStudio();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navItems: { id: AppTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'studio-t2v', label: 'Text to Video', icon: <Video className="w-4 h-4" /> },
    { id: 'studio-i2v', label: 'Image to Video', icon: <ImageIcon className="w-4 h-4" /> },
    {
      id: 'gallery',
      label: 'Creations',
      icon: <Layers className="w-4 h-4" />,
      badge: creations.length > 0 ? creations.length : undefined,
    },
    { id: 'models', label: 'Model Hub', icon: <Cpu className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: AppTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-studio-border bg-studio-bg/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('studio-t2v')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-wider text-slate-100 group-hover:text-amber-400 transition-colors">
                  OPEN VIDEO STUDIO
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Open-Source AI Video Studio
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                        isActive ? 'bg-amber-400 text-slate-950' : 'bg-studio-surface text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Provider Indicator & GitHub */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Active Provider Pill */}
            <button
              onClick={() => handleNavClick('settings')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-studio-surface border border-studio-border hover:border-slate-500 text-xs font-mono transition-colors cursor-pointer"
              title="Click to configure inference provider"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isGenerating ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                }`}
              />
              <span className="text-slate-300">
                {activeProviderType === 'realistic-ai'
                  ? '⚡ Realistic AI'
                  : activeProviderType === 'demo'
                  ? 'Demo (Offline)'
                  : activeProviderType === 'huggingface'
                  ? 'Hugging Face'
                  : 'Local ComfyUI'}
              </span>
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-studio-border cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-studio-border bg-studio-card/95 backdrop-blur-2xl p-4 space-y-2 animate-in slide-in-from-top-3 duration-200">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-studio-surface text-slate-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Provider: {activeProviderType.toUpperCase()}
            </span>
            <button
              onClick={() => handleNavClick('settings')}
              className="text-xs text-amber-400 underline cursor-pointer"
            >
              Configure
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
