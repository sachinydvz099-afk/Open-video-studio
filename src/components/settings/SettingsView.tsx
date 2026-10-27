import React, { useState } from 'react';
import { useStudio } from '../../store/appState';
import { providerManager, ProviderType } from '../../providers/providerRegistry';
import { DemoSimulationSpeed, SimulatedErrorType } from '../../providers/DemoProvider';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Server,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Lock,
  Globe,
  RefreshCw,
  KeyRound,
  Terminal,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    activeProviderType,
    setActiveProviderType,
    addToast,
  } = useStudio();

  // Realistic AI Provider settings
  const realisticAiProvider = providerManager.getRealisticAiProvider();
  const [realisticTestResult, setRealisticTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [isTestingRealistic, setIsTestingRealistic] = useState<boolean>(false);

  // Demo Provider settings
  const demoProvider = providerManager.getDemoProvider();
  const [demoSpeed, setDemoSpeed] = useState<DemoSimulationSpeed>('normal');
  const [demoErrorSim, setDemoErrorSim] = useState<SimulatedErrorType>('none');

  // Hugging Face Provider settings
  const hfProvider = providerManager.getHuggingFaceProvider();
  const [hfSpaceId, setHfSpaceId] = useState<string>(hfProvider.getConfig().spaceId);
  const [hfToken, setHfToken] = useState<string>(hfProvider.getConfig().userToken || '');
  const [hfCustomUrl, setHfCustomUrl] = useState<string>(hfProvider.getConfig().customEndpointUrl || '');
  const [hfTestResult, setHfTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [isTestingHf, setIsTestingHf] = useState<boolean>(false);

  // Custom Local Provider settings
  const customProvider = providerManager.getCustomProvider();
  const [customEndpoint, setCustomEndpoint] = useState<string>(customProvider.getConfig().endpointUrl);
  const [customTestResult, setCustomTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [isTestingCustom, setIsTestingCustom] = useState<boolean>(false);

  // Handle Realistic AI test
  const handleTestRealistic = async () => {
    setIsTestingRealistic(true);
    setRealisticTestResult(null);
    try {
      const res = await realisticAiProvider.testConnection();
      setRealisticTestResult(res);
      addToast({
        type: res.success ? 'success' : 'warning',
        title: res.success ? 'Realistic AI Engine Ready' : 'Offline Mode',
        message: res.message,
      });
    } finally {
      setIsTestingRealistic(false);
    }
  };

  const handleApplyHfPreset = (presetSpace: string) => {
    setHfSpaceId(presetSpace);
    hfProvider.updateConfig({ spaceId: presetSpace });
    addToast({
      type: 'info',
      title: 'Hugging Face Preset Applied',
      message: `Space set to "${presetSpace}". Click "Save Settings" or "Test Connection" to verify.`,
    });
  };

  // Handle Demo changes
  const handleSpeedChange = (speed: DemoSimulationSpeed) => {
    setDemoSpeed(speed);
    demoProvider.setSimulationSpeed(speed);
    addToast({
      type: 'info',
      title: 'Demo Speed Updated',
      message: `Simulated job duration set to ${speed}.`,
    });
  };

  const handleErrorSimChange = (err: SimulatedErrorType) => {
    setDemoErrorSim(err);
    demoProvider.setErrorSimulation(err);
    addToast({
      type: 'info',
      title: 'Error Simulation Changed',
      message: err === 'none' ? 'Error simulation disabled.' : `Simulating ${err} error on next run.`,
    });
  };

  // Handle HF changes
  const handleSaveHfConfig = () => {
    hfProvider.updateConfig({
      spaceId: hfSpaceId.trim(),
      userToken: hfToken.trim() || undefined,
      customEndpointUrl: hfCustomUrl.trim() || undefined,
    });
    addToast({
      type: 'success',
      title: 'Hugging Face Config Saved',
      message: `Updated target Space to "${hfSpaceId}". Token is stored only in session memory.`,
    });
  };

  const handleTestHfConnection = async () => {
    setIsTestingHf(true);
    setHfTestResult(null);
    try {
      hfProvider.updateConfig({
        spaceId: hfSpaceId.trim(),
        userToken: hfToken.trim() || undefined,
        customEndpointUrl: hfCustomUrl.trim() || undefined,
      });
      const res = await hfProvider.testConnection();
      setHfTestResult(res);
      addToast({
        type: res.success ? 'success' : 'warning',
        title: res.success ? 'Connection Verified' : 'Space Unavailable',
        message: res.message,
      });
    } finally {
      setIsTestingHf(false);
    }
  };

  // Handle Custom Provider changes
  const handleSaveCustom = () => {
    customProvider.updateConfig({
      endpointUrl: customEndpoint.trim(),
    });
    addToast({
      type: 'success',
      title: 'Custom Endpoint Saved',
      message: `Endpoint set to ${customEndpoint}.`,
    });
  };

  const handleTestCustom = async () => {
    setIsTestingCustom(true);
    setCustomTestResult(null);
    try {
      customProvider.updateConfig({
        endpointUrl: customEndpoint.trim(),
      });
      const res = await customProvider.testConnection();
      setCustomTestResult(res);
      addToast({
        type: res.success ? 'success' : 'error',
        title: res.success ? 'Connected' : 'Connection Failed',
        message: res.message,
      });
    } finally {
      setIsTestingCustom(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-studio-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              Provider Settings & Inference Configuration
            </h1>
            <Badge variant="amber" size="md">
              Client-Side Only
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose your AI inference engine: run 100% offline with Demo mode, connect to Hugging Face Spaces, or link a local ComfyUI GPU.
          </p>
        </div>

        <Badge variant="emerald" size="sm">
          ₹0 Budget Compliant
        </Badge>
      </div>

      {/* Provider Selector Cards */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Active Inference Provider
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Realistic AI Engine */}
          <div
            onClick={() => setActiveProviderType('realistic-ai')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
              activeProviderType === 'realistic-ai'
                ? 'bg-amber-500/15 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
                : 'bg-studio-card border-studio-border hover:border-slate-600'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Realistic AI Engine</span>
                </span>
                <Badge variant={activeProviderType === 'realistic-ai' ? 'amber' : 'emerald'} size="sm">
                  {activeProviderType === 'realistic-ai' ? 'Active' : 'Recommended'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Generates authentic photorealistic AI videos from your prompt with 3D cinematic camera physics, atmospheric lighting, and high-definition stream encoding.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>Real Diffusion • Instant & Free</span>
            </div>
          </div>

          {/* Card 2: Hugging Face Spaces */}
          <div
            onClick={() => setActiveProviderType('huggingface')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
              activeProviderType === 'huggingface'
                ? 'bg-cyan-500/15 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                : 'bg-studio-card border-studio-border hover:border-slate-600'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Hugging Face Spaces</span>
                </span>
                <Badge variant={activeProviderType === 'huggingface' ? 'cyan' : 'slate'} size="sm">
                  {activeProviderType === 'huggingface' ? 'Active' : 'ZeroGPU'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Connects directly to remote Hugging Face Gradio ZeroGPU queues (e.g. Wan2.1 public spaces) over SSE stream.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-medium">
              <Globe className="w-3.5 h-3.5" />
              <span>Real Remote Cloud GPU</span>
            </div>
          </div>

          {/* Card 3: Custom / ComfyUI */}
          <div
            onClick={() => setActiveProviderType('custom')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
              activeProviderType === 'custom'
                ? 'bg-indigo-500/15 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                : 'bg-studio-card border-studio-border hover:border-slate-600'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-violet-400" />
                  <span>Local ComfyUI</span>
                </span>
                <Badge variant={activeProviderType === 'custom' ? 'violet' : 'slate'} size="sm">
                  {activeProviderType === 'custom' ? 'Active' : 'Local GPU'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Connects directly to your local ComfyUI workflow running on your own workstation GPU (e.g. 127.0.0.1:8188).
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-indigo-400 font-medium">
              <Cpu className="w-3.5 h-3.5" />
              <span>Private & Unmetered</span>
            </div>
          </div>

          {/* Card 4: Demo Engine */}
          <div
            onClick={() => setActiveProviderType('demo')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
              activeProviderType === 'demo'
                ? 'bg-slate-500/15 border-slate-500 shadow-xl shadow-slate-500/10 ring-1 ring-slate-500/30'
                : 'bg-studio-card border-studio-border hover:border-slate-600'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-100">Offline Simulation</span>
                <Badge variant={activeProviderType === 'demo' ? 'amber' : 'slate'} size="sm">
                  {activeProviderType === 'demo' ? 'Active' : 'Offline'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Local offline simulation mode with GPU scheduler logs. Zero network required.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>Zero-cost & Offline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Details Configuration Panels */}
      {activeProviderType === 'realistic-ai' && (
        <div className="p-6 rounded-2xl bg-studio-card border border-studio-border shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Realistic AI Video Engine Configuration</span>
            </h3>
            <Badge variant="emerald" size="sm">
              Default Recommended Engine
            </Badge>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The Realistic AI Video Engine synthesizes photorealistic diffusion keyframes tailored directly to your prompt, applies 3D cinematic camera trajectories (push-in, pull-back, pan, orbit), and encodes genuine high-definition WebM/MP4 video streams in real time. Zero API key, token, or GPU workstation required.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-studio-surface border border-studio-border text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Diffusion Latents</span>
              <span className="text-slate-200 font-semibold">Photorealistic 8K Synthesis</span>
            </div>
            <div className="p-3 rounded-xl bg-studio-surface border border-studio-border text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Camera Trajectories</span>
              <span className="text-slate-200 font-semibold">6-DOF Cinematic Motion</span>
            </div>
            <div className="p-3 rounded-xl bg-studio-surface border border-studio-border text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Video Stream Output</span>
              <span className="text-slate-200 font-semibold">WebM / MP4 Video</span>
            </div>
          </div>

          {/* Test Connection Button */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestRealistic}
              isLoading={isTestingRealistic}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Test Neural Engine Connection
            </Button>
          </div>

          {/* Test result output */}
          {realisticTestResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                realisticTestResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold mb-1">
                {realisticTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                )}
                <span>
                  {realisticTestResult.success ? 'Neural Cluster Verified' : 'Local Fallback Ready'}
                </span>
                {realisticTestResult.latencyMs !== undefined && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30">
                    {realisticTestResult.latencyMs}ms
                  </span>
                )}
              </div>
              <p>{realisticTestResult.message}</p>
            </div>
          )}
        </div>
      )}

      {activeProviderType === 'demo' && (
        <div className="p-6 rounded-2xl bg-studio-card border border-studio-border shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Demo Engine Configuration</span>
            </h3>
            <Badge variant="amber" size="sm">
              Default Experience
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Simulation Speed */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Simulated Generation Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { speed: 'fast', label: 'Fast (4s)' },
                  { speed: 'normal', label: 'Normal (7s)' },
                  { speed: 'realistic', label: 'Realistic (14s)' },
                ].map((s) => (
                  <button
                    key={s.speed}
                    type="button"
                    onClick={() => handleSpeedChange(s.speed as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                      demoSpeed === s.speed
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                        : 'bg-studio-surface border-studio-border text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Injection Testing */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Simulate Inference Errors (Testing)
              </label>
              <select
                value={demoErrorSim}
                onChange={(e) => handleErrorSimChange(e.target.value as any)}
                className="w-full py-2 px-3 rounded-xl text-xs bg-studio-surface border border-studio-border text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="none">None (Successful Generation)</option>
                <option value="oom">CUDA Out of Memory (OOM)</option>
                <option value="content_policy">Content Moderation Flag</option>
                <option value="timeout">Cold Start / Worker Timeout</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeProviderType === 'huggingface' && (
        <div className="p-6 rounded-2xl bg-studio-card border border-studio-border shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Hugging Face Gradio Space Integration</span>
            </h3>
            <Badge variant="cyan" size="sm">
              Community ZeroGPU
            </Badge>
          </div>

          <div className="space-y-4">
            {/* Target Space */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Hugging Face Space ID or URL
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Tested Spaces:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyHfPreset('multimodalart/wan2-1-fast')}
                    className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors cursor-pointer"
                  >
                    ⚡ multimodalart/wan2-1-fast
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyHfPreset('Wan-AI/Wan2.1')}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Wan-AI/Wan2.1
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={hfSpaceId}
                onChange={(e) => setHfSpaceId(e.target.value)}
                placeholder="e.g. multimodalart/wan2-1-fast or Wan-AI/Wan2.1"
                className="w-full py-2.5 px-3 rounded-xl text-xs font-mono bg-studio-surface border border-studio-border text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-500">
                You can specify any compatible Gradio 4/5 space providing Wan2.1, LTX-Video, or CogVideoX inference.
              </p>
            </div>

            {/* Optional HF Token */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Optional Hugging Face User Access Token</span>
              </label>
              <input
                type="password"
                value={hfToken}
                onChange={(e) => setHfToken(e.target.value)}
                placeholder="hf_..."
                className="w-full py-2.5 px-3 rounded-xl text-xs font-mono bg-studio-surface border border-studio-border text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <span className="text-amber-400 font-semibold">Privacy Guarantee:</span> Your token is stored strictly in client-side React memory. It is never logged, never committed, and never sent to any server except directly to Hugging Face.
              </p>
            </div>

            {/* Test Connection Button */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveHfConfig}
              >
                Save Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestHfConnection}
                isLoading={isTestingHf}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Test Connection
              </Button>
            </div>

            {/* Connection Test Output */}
            {hfTestResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  hfTestResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold mb-1">
                  {hfTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>
                    {hfTestResult.success ? 'Space Reachable' : 'Space Notice'} (
                    {hfTestResult.latencyMs}ms)
                  </span>
                </div>
                <p>{hfTestResult.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeProviderType === 'custom' && (
        <div className="p-6 rounded-2xl bg-studio-card border border-studio-border shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Custom Inference Server (Local ComfyUI)</span>
            </h3>
            <Badge variant="violet" size="sm">
              Localhost / Webhook
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                ComfyUI Server Endpoint
              </label>
              <input
                type="text"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="http://127.0.0.1:8188"
                className="w-full py-2.5 px-3 rounded-xl text-xs font-mono bg-studio-surface border border-studio-border text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500">
                Ensure ComfyUI is running with <code className="text-amber-400">--enable-cors-header</code> flag.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveCustom}
              >
                Save Endpoint
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestCustom}
                isLoading={isTestingCustom}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Ping Server
              </Button>
            </div>

            {customTestResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  customTestResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold mb-1">
                  {customTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>Status ({customTestResult.latencyMs}ms)</span>
                </div>
                <p>{customTestResult.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security & Zero ₹ Architecture Box */}
      <div className="p-6 rounded-2xl bg-studio-surface/50 border border-studio-border space-y-3">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Security, Privacy, and Zero-Budget Architecture</span>
        </div>
        <ul className="text-xs text-slate-400 space-y-1.5 leading-relaxed list-disc list-inside">
          <li><strong>No hidden backend:</strong> Open Video Studio is an entirely client-side static application hosted for free on GitHub Pages.</li>
          <li><strong>Zero cloud costs:</strong> No paid subscriptions, paid databases, or paid APIs required.</li>
          <li><strong>Private tokens:</strong> Tokens are kept in volatile browser memory only and never transmitted to third parties.</li>
          <li><strong>Local data storage:</strong> Creation history is stored exclusively in your browser's localStorage.</li>
        </ul>
      </div>
    </div>
  );
};
