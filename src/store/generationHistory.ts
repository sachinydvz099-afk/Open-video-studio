import { AspectRatio, JobMode } from '../providers/types';
import { SAMPLE_VIDEOS } from '../assets/samples/samplesData';

export interface CreationRecord {
  id: string;
  title: string;
  mode: JobMode;
  modelId: string;
  prompt: string;
  negativePrompt?: string;
  sourceImageUrl?: string;
  aspectRatio: AspectRatio;
  resolution: '480p' | '720p' | '1080p';
  durationSeconds: number;
  fps: number;
  videoUrl: string;
  createdAt: number;
  isFavorite: boolean;
  providerId: string;
  isSimulated: boolean;
  seed?: number;
  motionStrength?: number;
}

const STORAGE_KEY = 'open_video_studio_creations_v1';

/**
 * Returns initial sample gallery records to ensure immediate visual delight on first run.
 */
function getInitialSeedRecords(): CreationRecord[] {
  return SAMPLE_VIDEOS.map((sample, idx) => ({
    id: `seed-${sample.id}`,
    title: sample.title,
    mode: sample.mode,
    modelId: sample.modelId,
    prompt: sample.prompt,
    aspectRatio: sample.aspectRatio,
    resolution: sample.resolution,
    durationSeconds: sample.durationSeconds,
    fps: sample.fps,
    videoUrl: sample.remoteUrl || '',
    createdAt: Date.now() - (idx + 1) * 3600 * 1000 * 4,
    isFavorite: idx === 0 || idx === 3,
    providerId: 'demo-provider',
    isSimulated: true,
  }));
}

export function loadCreations(): CreationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedRecords();
      saveCreations(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return getInitialSeedRecords();
  } catch (err) {
    console.error('Failed to read generation history from localStorage', err);
    return getInitialSeedRecords();
  }
}

export function saveCreations(creations: CreationRecord[]): void {
  try {
    // Only store up to 50 recent items to respect localStorage limits (~5MB)
    const trimmed = creations.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save generation history to localStorage', err);
  }
}

export function addCreation(record: CreationRecord): CreationRecord[] {
  const current = loadCreations();
  // Prepend new creation
  const updated = [record, ...current.filter((c) => c.id !== record.id)];
  saveCreations(updated);
  return updated;
}

export function toggleFavoriteCreation(id: string): CreationRecord[] {
  const current = loadCreations();
  const updated = current.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
  saveCreations(updated);
  return updated;
}

export function deleteCreation(id: string): CreationRecord[] {
  const current = loadCreations();
  const target = current.find((c) => c.id === id);

  // Revoke object URL if it was created locally
  if (target?.videoUrl?.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(target.videoUrl);
    } catch {
      // ignore
    }
  }

  const updated = current.filter((c) => c.id !== id);
  saveCreations(updated);
  return updated;
}

export function clearAllCreations(): void {
  try {
    const current = loadCreations();
    for (const item of current) {
      if (item.videoUrl?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(item.videoUrl);
        } catch {
          // ignore
        }
      }
    }
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function exportCreationsJson(): string {
  const data = loadCreations();
  // Strip blob URLs when exporting to avoid invalid references on another device
  const sanitized = data.map((item) => ({
    ...item,
    videoUrl: item.videoUrl?.startsWith('blob:') ? '' : item.videoUrl,
  }));
  return JSON.stringify(sanitized, null, 2);
}

export function importCreationsJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'Imported file does not contain a valid JSON array.' };
    }

    const current = loadCreations();
    const existingIds = new Set(current.map((c) => c.id));
    const newItems: CreationRecord[] = [];

    for (const item of parsed) {
      if (item && item.id && item.prompt && item.modelId) {
        if (!existingIds.has(item.id)) {
          newItems.push({
            id: item.id,
            title: item.title || 'Imported Creation',
            mode: item.mode || 'text-to-video',
            modelId: item.modelId,
            prompt: item.prompt,
            negativePrompt: item.negativePrompt,
            aspectRatio: item.aspectRatio || '16:9',
            resolution: item.resolution || '720p',
            durationSeconds: item.durationSeconds || 5,
            fps: item.fps || 16,
            videoUrl: item.videoUrl || '',
            createdAt: item.createdAt || Date.now(),
            isFavorite: !!item.isFavorite,
            providerId: item.providerId || 'imported',
            isSimulated: !!item.isSimulated,
          });
        }
      }
    }

    const combined = [...newItems, ...current];
    saveCreations(combined);
    return { success: true, count: newItems.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Malformed JSON file.' };
  }
}
