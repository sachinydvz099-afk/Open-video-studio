import React, { useState, useEffect } from 'react';
import { StudioProvider, useStudio, AppTab } from './store/appState';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { TextToVideoWorkspace } from './components/studio/TextToVideoWorkspace';
import { ImageToVideoWorkspace } from './components/studio/ImageToVideoWorkspace';
import { CreationsGallery } from './components/gallery/CreationsGallery';
import { ModelRegistryView } from './components/models/ModelRegistryView';
import { SettingsView } from './components/settings/SettingsView';
import { AboutView } from './components/about/AboutView';
import { ToastContainer } from './components/common/Toast';
import { Modal } from './components/common/Modal';
import { ModelVariant } from './models/registry';
import { Badge } from './components/common/Badge';
import { ExternalLink, Cpu, Scale } from 'lucide-react';

const StudioMainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useStudio();
  const [inspectedModel, setInspectedModel] = useState<ModelVariant | null>(null);

  // Sync with window.location.hash for GitHub Pages friendly routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (['studio-t2v', 'studio-i2v', 'gallery', 'models', 'settings', 'about'].includes(hash)) {
        setActiveTab(hash as AppTab);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setActiveTab]);

  useEffect(() => {
    if (window.location.hash !== `#/${activeTab}`) {
      window.history.replaceState(null, '', `#/${activeTab}`);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-studio-bg selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Studio Navbar */}
      <Navbar />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'studio-t2v' && <TextToVideoWorkspace onOpenModelModal={setInspectedModel} />}
        {activeTab === 'studio-i2v' && <ImageToVideoWorkspace onOpenModelModal={setInspectedModel} />}
        {activeTab === 'gallery' && <CreationsGallery />}
        {activeTab === 'models' && <ModelRegistryView />}
        {activeTab === 'settings' && <SettingsView />}
        {activeTab === 'about' && <AboutView />}
      </main>

      {/* Global Toast Container */}
      <ToastContainer />

      {/* Quick Model Info Inspection Modal */}
      {inspectedModel && (
        <Modal
          isOpen={!!inspectedModel}
          onClose={() => setInspectedModel(null)}
          title={inspectedModel.name}
          subtitle={`Architecture: ${inspectedModel.architecture}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="amber" size="sm">
                {inspectedModel.license}
              </Badge>
              <Badge variant="cyan" size="sm">
                {inspectedModel.parameters}
              </Badge>
              <Badge variant="slate" size="sm">
                Min {inspectedModel.vramRequirements.minimumVramGb}GB VRAM
              </Badge>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {inspectedModel.description}
            </p>

            <div className="p-3.5 rounded-xl bg-studio-surface border border-white/5 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Native Resolution:</span>
                <span className="text-slate-200">{inspectedModel.nativeResolutions.join(', ')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Maximum Frames:</span>
                <span className="text-slate-200">{inspectedModel.maxFrames} frames</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Native Frame Rate:</span>
                <span className="text-slate-200">{inspectedModel.nativeFps} FPS</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                <Cpu className="w-3.5 h-3.5" />
                <span>Memory & Hardware Requirements</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                {inspectedModel.vramRequirements.quantizedNote}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
              <a
                href={`https://huggingface.co/${inspectedModel.huggingFaceRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-colors"
              >
                <span>Hugging Face Model Card</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <StudioProvider>
      <StudioMainContent />
    </StudioProvider>
  );
};

export default App;
