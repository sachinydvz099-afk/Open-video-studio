import React from 'react';
import { Badge } from '../common/Badge';
import {
  ShieldCheck,
  Scale,
  Film,
  Cpu,
  Github,
  Heart,
  ExternalLink,
  Code2,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const licenses = [
    {
      name: 'Open Video Studio (Frontend)',
      license: 'MIT License',
      author: 'Open Source Community',
      url: 'https://opensource.org/licenses/MIT',
      desc: 'Free to use, modify, distribute, and self-host for personal and commercial projects.',
    },
    {
      name: 'Wan2.1 (T2V & I2V Checkpoints)',
      license: 'Apache 2.0',
      author: 'Wan-AI (Alibaba Cloud)',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
      desc: 'Permissive open-source license allowing research and commercial utilization.',
    },
    {
      name: 'LTX-Video 0.9.1',
      license: 'OpenRAIL-M',
      author: 'Lightricks',
      url: 'https://huggingface.co/Lightricks/LTX-Video/blob/main/LICENSE.txt',
      desc: 'Open weights license with ethical use and safety guidelines.',
    },
    {
      name: 'CogVideoX-5B',
      license: 'Apache 2.0',
      author: 'THUDM / Zhipu AI',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
      desc: 'Open research weights and transformer architecture.',
    },
    {
      name: 'Lucide React',
      license: 'ISC License',
      author: 'Lucide Contributors',
      url: 'https://lucide.dev/license',
      desc: 'Clean, open-source icon suite.',
    },
    {
      name: 'Tailwind CSS',
      license: 'MIT License',
      author: 'Tailwind Labs Inc.',
      url: 'https://tailwindcss.com',
      desc: 'Utility-first CSS framework.',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center space-y-3 py-6">
        <Badge variant="amber" size="md">
          Open-Source AI Video Generation Studio
        </Badge>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Democratizing Cinematic Video Creation
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Open Video Studio is a modern, ₹0 budget, client-side web application inspired by the finest AI generative studios. It bridges state-of-the-art open-weights video models directly to creators worldwide.
        </p>
      </div>

      {/* Feature Matrix / Core Tenets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-studio-card border border-studio-border space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Zero Mandatory GPU</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Includes a comprehensive offline Demo Provider with realistic simulation steps and genuine video generation for zero-cost exploration.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-studio-card border border-studio-border space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">100% Open Weights</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Audited for verified open architectures like Wan2.1 (Apache 2.0) and CogVideoX, avoiding proprietary lock-in.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-studio-card border border-studio-border space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Privacy & Static Security</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Runs client-side in your browser. No user tracking, no backend database, and zero secrets committed or bundled.
          </p>
        </div>
      </div>

      {/* Open Source Licenses Table */}
      <div className="p-6 rounded-2xl bg-studio-card border border-studio-border shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Model & Third-Party License Register</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified licensing compliance for all software and foundation models utilized.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {licenses.map((lic, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-studio-surface/50 border border-white/5 space-y-1.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-xs font-bold text-slate-200">{lic.name}</h4>
                  <Badge variant="amber" size="sm">
                    {lic.license}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{lic.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                <span className="text-slate-500 font-mono">{lic.author}</span>
                <a
                  href={lic.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
                >
                  <span>License</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ethical Usage Notice */}
      <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2 text-xs leading-relaxed text-slate-300">
        <h4 className="font-bold text-amber-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Ethical Generative Media Guidelines</span>
        </h4>
        <p>
          Open Video Studio is dedicated to creative storytelling, digital art, pre-visualization, and film exploration. Users must adhere to open-source foundation model terms, avoid synthesizing deceptive likenesses or non-consensual media, and uphold responsible AI principles.
        </p>
      </div>
    </div>
  );
};
