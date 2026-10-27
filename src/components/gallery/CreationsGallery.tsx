import React, { useState, useRef } from 'react';
import { useStudio } from '../../store/appState';
import { CreationRecord, exportCreationsJson, importCreationsJson } from '../../store/generationHistory';
import { VideoDetailModal } from './VideoDetailModal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatRelativeTime } from '../../utils/formatters';
import {
  Film,
  Search,
  Heart,
  Play,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

export const CreationsGallery: React.FC = () => {
  const {
    creations,
    toggleFavorite,
    removeCreation,
    clearHistory,
    reuseSettings,
    refreshCreations,
    addToast,
    setActiveTab,
  } = useStudio();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'text-to-video' | 'image-to-video' | 'favorites'>('all');
  const [selectedCreation, setSelectedCreation] = useState<CreationRecord | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);

  // Filter creations
  const filteredCreations = creations.filter((item) => {
    const matchesQuery =
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.modelId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (activeFilter === 'text-to-video') return item.mode === 'text-to-video';
    if (activeFilter === 'image-to-video') return item.mode === 'image-to-video';
    if (activeFilter === 'favorites') return item.isFavorite;
    return true;
  });

  const handleExport = () => {
    const jsonStr = exportCreationsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `open-video-studio-history-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'History Exported',
      message: 'Downloaded creation metadata JSON file.',
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = importCreationsJson(text);
      if (res.success) {
        refreshCreations();
        addToast({
          type: 'success',
          title: 'Import Successful',
          message: `Restored ${res.count} creation items to your studio history.`,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Import Failed',
          message: res.error || 'Invalid JSON format.',
        });
      }
    };
    reader.readAsText(file);
    if (importInputRef.current) importInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-studio-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              Creations & Generation History
            </h1>
            <Badge variant="amber" size="md">
              {creations.length} Clips
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, play, download, and reuse prompt recipes from your previous video generations.
          </p>
        </div>

        {/* Action Controls: Export, Import, Clear */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => importInputRef.current?.click()}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Import
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export
          </Button>

          {creations.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm('Clear all creation history from browser memory?')) {
                  clearHistory();
                }
              }}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-studio-surface border border-studio-border overflow-x-auto">
          {[
            { id: 'all', label: 'All Clips' },
            { id: 'text-to-video', label: 'Text-to-Video' },
            { id: 'image-to-video', label: 'Image-to-Video' },
            { id: 'favorites', label: 'Favorites' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts or models..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-studio-surface border border-studio-border text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Video Grid */}
      {filteredCreations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredCreations.map((item) => (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedCreation(item)}
              className="group relative rounded-2xl bg-studio-card border border-studio-border hover:border-amber-500/50 shadow-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between"
            >
              {/* Media Container */}
              <div className="relative aspect-video bg-black/80 overflow-hidden flex items-center justify-center">
                {item.videoUrl ? (
                  <video
                    src={item.videoUrl}
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(el) => {
                      if (el) {
                        if (hoveredId === item.id) {
                          el.play().catch(() => {});
                        } else {
                          el.pause();
                          el.currentTime = 0;
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 bg-studio-surface">
                    <Film className="w-8 h-8" />
                  </div>
                )}

                {/* Overlay Play Icon on Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/50 transform scale-75 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <Badge variant="outline" size="sm">
                    {item.aspectRatio}
                  </Badge>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className={`p-1.5 rounded-lg backdrop-blur-md border pointer-events-auto transition-colors cursor-pointer ${
                      item.isFavorite
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-black/50 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Bottom Duration Badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono text-slate-300 border border-white/10">
                  {item.durationSeconds}s
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Badge variant={item.mode === 'text-to-video' ? 'amber' : 'cyan'} size="sm">
                      {item.mode === 'text-to-video' ? 'T2V' : 'I2V'}
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-500 truncate">
                      {item.modelId}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-500">
                  <span>{formatRelativeTime(item.createdAt)}</span>
                  <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold">
                    <span>Inspect</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-card/60 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No creations found</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
            {searchQuery
              ? `No creations matched query "${searchQuery}". Try a different keyword.`
              : 'You have not generated any video clips yet. Switch to the studio workspace to render your first scene.'}
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              size="md"
              onClick={() => setActiveTab('studio-t2v')}
              leftIcon={<Sparkles className="w-4 h-4 fill-current" />}
            >
              Start Generating
            </Button>
          </div>
        </div>
      )}

      {/* Video Inspection Modal */}
      <VideoDetailModal
        creation={selectedCreation}
        isOpen={!!selectedCreation}
        onClose={() => setSelectedCreation(null)}
        onReuseSettings={reuseSettings}
        onToggleFavorite={toggleFavorite}
        onDelete={removeCreation}
      />
    </div>
  );
};
